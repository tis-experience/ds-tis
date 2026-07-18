/* ============================================================
   tabs.js — runtime público para Tabs (required)

   Anatomia e estados visuais: css/components/tabs.css
   Uso:
     <div class="ds-tabs" role="tablist" aria-label="…">
       <button class="ds-tab ds-tab--active" role="tab"
               aria-selected="true" aria-controls="panel-1"
               id="tab-1">…</button>
       <button class="ds-tab" role="tab"
               aria-selected="false" aria-controls="panel-2"
               id="tab-2" tabindex="-1">…</button>
     </div>
     <div class="ds-tab-panel" role="tabpanel" id="panel-1"
          aria-labelledby="tab-1">…</div>
     <div class="ds-tab-panel" role="tabpanel" id="panel-2"
          aria-labelledby="tab-2" hidden>…</div>

   Ciclo de vida:
     const instances = initTabs(root);
     destroyTabs(root); // ou instance.destroy()
   ============================================================ */

const instances = new Set();

function getTabs(tablist) {
  return [...tablist.querySelectorAll(':scope > .ds-tab[role="tab"]')];
}

function isDisabled(tab) {
  return tab.disabled || tab.getAttribute('aria-disabled') === 'true';
}

function getEnabledTabs(tabs) {
  return tabs.filter((tab) => !isDisabled(tab));
}

function getPanel(tab) {
  const id = tab.getAttribute('aria-controls');
  return id ? tab.ownerDocument.getElementById(id) : null;
}

function emit(tablist, name, detail) {
  tablist.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function createInstance(tablist) {
  const tabs = getTabs(tablist);
  if (!tabs.length) return null;

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const inst = {
    root: tablist,
    select(tab, { focus = false } = {}) {
      if (!tab || !tabs.includes(tab) || isDisabled(tab)) return;
      const previous = tabs.find((item) => item.getAttribute('aria-selected') === 'true') || null;
      if (previous === tab) {
        if (focus) tab.focus();
        return;
      }

      for (const item of tabs) {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.classList.toggle('ds-tab--active', selected);
        item.tabIndex = selected ? 0 : -1;
        const panel = getPanel(item);
        if (panel) panel.hidden = !selected;
      }

      if (focus) tab.focus();
      emit(tablist, 'ds-tabs-change', {
        root: tablist,
        tab,
        panel: getPanel(tab),
        previousTab: previous,
      });
    },
    destroy() {
      while (cleanups.length) cleanups.pop()();
      delete tablist.dataset.dsTabsInit;
      instances.delete(inst);
    },
  };

  function moveSelection(current, direction) {
    const enabled = getEnabledTabs(tabs);
    if (!enabled.length) return;
    const currentIndex = enabled.indexOf(current);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'first') nextIndex = 0;
    else if (direction === 'last') nextIndex = enabled.length - 1;
    else nextIndex = (currentIndex + direction + enabled.length) % enabled.length;

    inst.select(enabled[nextIndex], { focus: true });
  }

  // Sync initial state from markup (prefer aria-selected / --active).
  let initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true' && !isDisabled(tab))
    || tabs.find((tab) => tab.classList.contains('ds-tab--active') && !isDisabled(tab))
    || getEnabledTabs(tabs)[0]
    || null;

  for (const tab of tabs) {
    if (tab instanceof HTMLButtonElement && !tab.hasAttribute('type')) {
      tab.type = 'button';
    }
    const selected = tab === initial;
    tab.setAttribute('aria-selected', String(selected));
    tab.classList.toggle('ds-tab--active', selected);
    tab.tabIndex = selected ? 0 : -1;
    const panel = getPanel(tab);
    if (panel) {
      panel.hidden = !selected;
      if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;
    }
  }

  for (const tab of tabs) {
    on(tab, 'click', (event) => {
      event.preventDefault();
      if (isDisabled(tab)) return;
      inst.select(tab, { focus: true });
    });

    on(tab, 'keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveSelection(tab, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveSelection(tab, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        moveSelection(tab, 'first');
      } else if (e.key === 'End') {
        e.preventDefault();
        moveSelection(tab, 'last');
      }
    });
  }

  return inst;
}

function isInside(root, node) {
  return root === document || root === node || (typeof root.contains === 'function' && root.contains(node));
}

/**
 * @param {ParentNode} [root]
 */
export function initTabs(root = document) {
  const created = [];
  const tablists = [];

  if (root instanceof Element && root.matches('.ds-tabs')) tablists.push(root);
  if (typeof root.querySelectorAll === 'function') {
    tablists.push(...root.querySelectorAll('.ds-tabs'));
  }

  tablists.forEach((tablist) => {
    if (!tablist.hasAttribute('role')) tablist.setAttribute('role', 'tablist');
    if (tablist.dataset.dsTabsInit === 'true') return;
    const inst = createInstance(tablist);
    if (inst) {
      tablist.dataset.dsTabsInit = 'true';
      instances.add(inst);
      created.push(inst);
    }
  });

  return created;
}

/**
 * @param {ParentNode} [root]
 */
export function destroyTabs(root = document) {
  for (const inst of [...instances]) {
    if (isInside(root, inst.root)) inst.destroy();
  }
}

/**
 * @param {HTMLElement} tab
 */
export function selectTab(tab) {
  const tablist = tab?.closest?.('.ds-tabs');
  const inst = [...instances].find((item) => item.root === tablist);
  inst?.select(tab, { focus: true });
  return inst;
}
