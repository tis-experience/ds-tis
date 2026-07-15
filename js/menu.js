/* ============================================================
   menu.js — comportamento opt-in para Action Menu

   Anatomia e estados visuais: css/components/menu.css
   Uso:
     <div class="ds-action-menu">
       <button class="ds-button ds-action-menu__trigger"
               type="button"
               aria-haspopup="menu"
               aria-expanded="false"
               aria-controls="menu-id">...</button>
       <div class="ds-menu ds-action-menu__content" id="menu-id" role="menu">...</div>
     </div>
   ============================================================ */

const instances = new Set();

function getMenuItems(menu) {
  return [...menu.querySelectorAll('.ds-menu__item[role="menuitem"]:not([disabled])')];
}

function focusItem(items, index) {
  const item = items[index];
  if (!item) return;
  items.forEach((node) => node.removeAttribute('data-active'));
  item.setAttribute('data-active', 'true');
  item.focus();
}

function createInstance(root) {
  const trigger = root.querySelector('.ds-action-menu__trigger');
  const menu = root.querySelector('.ds-action-menu__content[role="menu"], .ds-menu[role="menu"]');
  if (!trigger || !menu) return null;

  const inst = {
    root,
    trigger,
    menu,
    open() {
      root.dataset.open = 'true';
      trigger.setAttribute('aria-expanded', 'true');
      const items = getMenuItems(menu);
      if (items.length > 0) focusItem(items, 0);
    },
    close() {
      delete root.dataset.open;
      trigger.setAttribute('aria-expanded', 'false');
      getMenuItems(menu).forEach((item) => item.removeAttribute('data-active'));
      trigger.focus();
    },
    toggle() {
      if (root.dataset.open === 'true') inst.close();
      else inst.open();
    },
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    inst.toggle();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inst.open();
    }
  });

  menu.addEventListener('keydown', (e) => {
    const items = getMenuItems(menu);
    const activeIndex = items.findIndex((item) => item.getAttribute('data-active') === 'true');

    if (e.key === 'Escape') {
      e.preventDefault();
      inst.close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
      focusItem(items, next);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
      focusItem(items, prev);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      focusItem(items, 0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      focusItem(items, items.length - 1);
      return;
    }
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const query = e.key.toLowerCase();
      const match = items.find((item, index) => {
        if (index <= activeIndex) return false;
        return item.textContent.trim().toLowerCase().startsWith(query);
      }) || items.find((item) => item.textContent.trim().toLowerCase().startsWith(query));
      if (match) {
        e.preventDefault();
        focusItem(items, items.indexOf(match));
      }
    }
  });

  for (const item of getMenuItems(menu)) {
    item.addEventListener('click', () => inst.close());
  }

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) inst.close();
  });

  if (root.dataset.open !== 'true') {
    trigger.setAttribute('aria-expanded', 'false');
  }

  return inst;
}

/**
 * @param {ParentNode} [root]
 */
export function initActionMenus(root = document) {
  const created = [];

  root.querySelectorAll('.ds-action-menu').forEach((actionMenu) => {
    if (actionMenu.dataset.dsActionMenuInit === 'true') return;
    actionMenu.dataset.dsActionMenuInit = 'true';
    const inst = createInstance(actionMenu);
    if (inst) {
      instances.add(inst);
      created.push(inst);
    }
  });

  return created;
}

/**
 * @param {HTMLElement} root
 */
export function openActionMenu(root) {
  const inst = [...instances].find((item) => item.root === root);
  inst?.open();
  return inst;
}

/**
 * @param {HTMLElement} root
 */
export function closeActionMenu(root) {
  const inst = [...instances].find((item) => item.root === root);
  inst?.close();
  return inst;
}
