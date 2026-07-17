/* ============================================================
   menu.js — runtime público para Action Menu (required)

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

   Ciclo de vida:
     const instances = initActionMenus(root);
     destroyActionMenus(root); // ou instance.destroy()
   ============================================================ */

const instances = new Set();
const MENU_ITEM_SELECTOR = [
  '.ds-menu__item[role="menuitem"]',
  '.ds-menu__item[role="menuitemradio"]',
  '.ds-menu__item[role="menuitemcheckbox"]',
].join(', ');

function getMenuItems(menu) {
  return [...menu.querySelectorAll(MENU_ITEM_SELECTOR)].filter((item) => !item.disabled);
}

function isDisabled(item) {
  return item.disabled || item.getAttribute('aria-disabled') === 'true';
}

function focusItem(items, index) {
  const item = items[index];
  if (!item) return;
  items.forEach((node) => node.removeAttribute('data-active'));
  item.setAttribute('data-active', 'true');
  item.focus();
}

function emit(root, name, detail) {
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function createInstance(root) {
  const trigger = root.querySelector('.ds-action-menu__trigger');
  const menu = root.querySelector('.ds-action-menu__content[role="menu"], .ds-menu[role="menu"]');
  if (!trigger || !menu) return null;

  const cleanups = [];
  let typeaheadBuffer = '';
  let typeaheadTimer = null;
  let focusFrame = null;
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const inst = {
    root,
    trigger,
    menu,
    open() {
      if (root.dataset.open === 'true') return;
      root.dataset.open = 'true';
      trigger.setAttribute('aria-expanded', 'true');
      const items = getMenuItems(menu);
      const firstItem = items[0] || null;
      if (firstItem) {
        focusItem(items, 0);
        focusFirstWhenVisible(firstItem);
      }
      emit(root, 'ds-menu-open', { root, trigger, menu, item: firstItem });
    },
    close() {
      if (root.dataset.open !== 'true') return;
      delete root.dataset.open;
      trigger.setAttribute('aria-expanded', 'false');
      cancelPendingFocus();
      clearTypeahead();
      getMenuItems(menu).forEach((item) => item.removeAttribute('data-active'));
      trigger.focus();
      emit(root, 'ds-menu-close', { root, trigger, menu });
    },
    toggle() {
      if (root.dataset.open === 'true') inst.close();
      else inst.open();
    },
    destroy() {
      cancelPendingFocus();
      clearTypeahead();
      if (root.dataset.open === 'true') {
        delete root.dataset.open;
        trigger.setAttribute('aria-expanded', 'false');
        getMenuItems(menu).forEach((item) => item.removeAttribute('data-active'));
      }
      while (cleanups.length) cleanups.pop()();
      delete root.dataset.dsActionMenuInit;
      instances.delete(inst);
    },
  };

  function cancelPendingFocus() {
    if (focusFrame !== null) cancelAnimationFrame(focusFrame);
    focusFrame = null;
  }

  function focusFirstWhenVisible(firstItem) {
    cancelPendingFocus();
    let attempts = 0;
    const attempt = () => {
      focusFrame = null;
      if (root.dataset.open !== 'true' || !instances.has(inst) || !firstItem.isConnected) return;
      if (getComputedStyle(menu).visibility === 'visible') {
        focusItem(getMenuItems(menu), 0);
        return;
      }
      attempts += 1;
      if (attempts >= 60) return;
      focusFrame = requestAnimationFrame(attempt);
    };
    focusFrame = requestAnimationFrame(attempt);
  }

  function clearTypeahead() {
    if (typeaheadTimer !== null) clearTimeout(typeaheadTimer);
    typeaheadTimer = null;
    typeaheadBuffer = '';
  }

  function scheduleTypeaheadReset() {
    if (typeaheadTimer !== null) clearTimeout(typeaheadTimer);
    typeaheadTimer = setTimeout(() => {
      typeaheadTimer = null;
      typeaheadBuffer = '';
    }, 500);
  }

  function activateItem(item) {
    if (isDisabled(item)) return false;
    const role = item.getAttribute('role');
    if (role === 'menuitemradio') {
      for (const radio of menu.querySelectorAll('.ds-menu__item[role="menuitemradio"]')) {
        radio.setAttribute('aria-checked', radio === item ? 'true' : 'false');
      }
    } else if (role === 'menuitemcheckbox') {
      item.setAttribute('aria-checked', item.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    }
    inst.close();
    return true;
  }

  on(trigger, 'click', (e) => {
    e.preventDefault();
    inst.toggle();
  });

  on(trigger, 'keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inst.open();
    }
  });

  on(menu, 'keydown', (e) => {
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
      typeaheadBuffer += e.key.toLowerCase();
      let query = typeaheadBuffer;
      let match = items.find((item, index) => {
        if (index <= activeIndex) return false;
        return item.textContent.trim().toLowerCase().startsWith(query);
      }) || items.find((item) => item.textContent.trim().toLowerCase().startsWith(query));
      if (!match && typeaheadBuffer.length > 1) {
        typeaheadBuffer = e.key.toLowerCase();
        query = typeaheadBuffer;
        match = items.find((item) => item.textContent.trim().toLowerCase().startsWith(query));
      }
      if (match) {
        e.preventDefault();
        focusItem(items, items.indexOf(match));
      }
      scheduleTypeaheadReset();
    }
  });

  on(menu, 'click', (e) => {
    const item = e.target.closest(MENU_ITEM_SELECTOR);
    if (!item || !menu.contains(item) || !isDisabled(item)) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  on(menu, 'click', (e) => {
    const item = e.target.closest(MENU_ITEM_SELECTOR);
    if (item && menu.contains(item)) activateItem(item);
  });

  on(document, 'click', (e) => {
    if (!root.contains(e.target)) inst.close();
  });

  on(document, 'keydown', (e) => {
    if (root.dataset.open !== 'true') return;
    if (e.key === 'Escape') {
      e.preventDefault();
      inst.close();
    }
  });

  if (root.dataset.open !== 'true') {
    trigger.setAttribute('aria-expanded', 'false');
  }

  return inst;
}

function isInside(root, node) {
  return root === document || root === node || (typeof root.contains === 'function' && root.contains(node));
}

/**
 * @param {ParentNode} [root]
 */
export function initActionMenus(root = document) {
  const created = [];

  const actionMenus = [
    ...(root instanceof Element && root.matches('.ds-action-menu') ? [root] : []),
    ...root.querySelectorAll('.ds-action-menu'),
  ];
  actionMenus.forEach((actionMenu) => {
    if (actionMenu.dataset.dsActionMenuInit === 'true') return;
    const inst = createInstance(actionMenu);
    if (inst) {
      actionMenu.dataset.dsActionMenuInit = 'true';
      instances.add(inst);
      created.push(inst);
    }
  });

  return created;
}

/**
 * @param {ParentNode} [root]
 */
export function destroyActionMenus(root = document) {
  for (const inst of [...instances]) {
    if (isInside(root, inst.root)) inst.destroy();
  }
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
