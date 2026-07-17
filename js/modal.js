/* ============================================================
   modal.js — runtime público para Modal / Dialog (required)

   Anatomia e estados visuais: css/components/modal.css
   Uso:
     <button data-ds-modal-open="confirm-modal">Delete</button>
     <div class="ds-modal-overlay" id="confirm-modal" hidden>
       <div class="ds-modal" role="dialog" aria-modal="true" aria-labelledby="...">
         ...
         <button class="ds-modal__close" type="button" aria-label="Close modal">...</button>
       </div>
     </div>

   Ciclo de vida:
     const instances = initModals(root);
     destroyModals(root); // ou instance.destroy()
   ============================================================ */

const instances = new Set();
const triggerControllers = new Map();

function getFocusable(container) {
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
}

function trapFocus(overlay, dialog) {
  function onKeyDown(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(dialog);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  overlay.addEventListener('keydown', onKeyDown);
  return () => overlay.removeEventListener('keydown', onKeyDown);
}

function emit(overlay, name, detail) {
  overlay.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function getBackgroundNodes(overlay) {
  const nodes = [];
  let current = overlay;
  while (current && current !== document.body) {
    const parent = current.parentElement;
    if (!parent) break;
    for (const sibling of parent.children) {
      if (sibling !== current) nodes.push(sibling);
    }
    current = parent;
  }
  return [...new Set(nodes)];
}

function syncDocumentOpenClass() {
  const hasOpenModal = [...instances].some((instance) => !instance.overlay.hidden);
  document.documentElement.classList.toggle('ds-modal-open', hasOpenModal);
}

function createInstance(overlay) {
  const dialog = overlay.querySelector('.ds-modal[role="dialog"], .ds-modal');
  if (!dialog) return null;
  if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');

  let previousFocus = null;
  let releaseFocusTrap = null;
  let inertStates = [];
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const inst = {
    overlay,
    dialog,
    open() {
      if (!overlay.hidden) return;
      previousFocus = document.activeElement;
      overlay.hidden = false;
      syncDocumentOpenClass();
      inertStates = getBackgroundNodes(overlay).map((node) => ({
        node,
        inert: node.inert,
        marker: node.getAttribute('data-ds-modal-inert'),
      }));
      for (const { node } of inertStates) {
        node.dataset.dsModalInert = 'true';
        node.inert = true;
      }
      releaseFocusTrap = trapFocus(overlay, dialog);
      const focusable = getFocusable(dialog);
      (focusable[0] || dialog).focus();
      emit(overlay, 'ds-modal-open', {
        overlay,
        dialog,
        trigger: previousFocus instanceof HTMLElement ? previousFocus : null,
      });
    },
    close() {
      if (overlay.hidden) return;
      const returnFocus = previousFocus;
      overlay.hidden = true;
      for (const { node, inert, marker } of inertStates) {
        if (marker === null) delete node.dataset.dsModalInert;
        else node.setAttribute('data-ds-modal-inert', marker);
        node.inert = inert;
      }
      inertStates = [];
      if (typeof releaseFocusTrap === 'function') releaseFocusTrap();
      releaseFocusTrap = null;
      if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
      previousFocus = null;
      syncDocumentOpenClass();
      emit(overlay, 'ds-modal-close', {
        overlay,
        dialog,
        returnFocus: returnFocus instanceof HTMLElement ? returnFocus : null,
      });
    },
    destroy() {
      inst.close();
      while (cleanups.length) cleanups.pop()();
      delete overlay.dataset.dsModalInit;
      instances.delete(inst);
    },
  };

  on(overlay, 'click', (e) => {
    if (e.target === overlay) inst.close();
  });

  on(overlay, 'keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      inst.close();
    }
  });

  for (const closeBtn of overlay.querySelectorAll('.ds-modal__close')) {
    on(closeBtn, 'click', () => inst.close());
  }

  return inst;
}

function bindTrigger(trigger) {
  if (triggerControllers.has(trigger)) return;
  const controller = new AbortController();
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = trigger.getAttribute('data-ds-modal-open');
    if (!targetId) return;
    const overlay = document.getElementById(targetId.replace(/^#/, ''));
    const inst = [...instances].find((item) => item.overlay === overlay);
    inst?.open();
  }, { signal: controller.signal });
  trigger.dataset.dsModalTriggerInit = 'true';
  triggerControllers.set(trigger, controller);
}

function unbindTrigger(trigger) {
  const controller = triggerControllers.get(trigger);
  if (!controller) return;
  controller.abort();
  triggerControllers.delete(trigger);
  delete trigger.dataset.dsModalTriggerInit;
}

function isInside(root, node) {
  return root === document || root === node || (typeof root.contains === 'function' && root.contains(node));
}

/**
 * @param {ParentNode} [root]
 */
export function initModals(root = document) {
  const created = [];

  const overlays = [
    ...(root instanceof Element && root.matches('.ds-modal-overlay') ? [root] : []),
    ...root.querySelectorAll('.ds-modal-overlay'),
  ];
  overlays.forEach((overlay) => {
    if (overlay.dataset.dsModalInit === 'true') return;
    const inst = createInstance(overlay);
    if (inst) {
      overlay.dataset.dsModalInit = 'true';
      instances.add(inst);
      created.push(inst);
    }
  });

  const triggers = [
    ...(root instanceof Element && root.matches('[data-ds-modal-open]') ? [root] : []),
    ...root.querySelectorAll('[data-ds-modal-open]'),
  ];
  triggers.forEach((trigger) => bindTrigger(trigger));

  return created;
}

/**
 * Remove listeners e estado de init dentro de `root`.
 * @param {ParentNode} [root]
 */
export function destroyModals(root = document) {
  for (const inst of [...instances]) {
    if (isInside(root, inst.overlay)) inst.destroy();
  }
  const triggers = [
    ...(root instanceof Element && root.matches('[data-ds-modal-open]') ? [root] : []),
    ...root.querySelectorAll('[data-ds-modal-open]'),
  ];
  triggers.forEach((trigger) => {
    if (isInside(root, trigger)) unbindTrigger(trigger);
  });
}

/**
 * @param {string|HTMLElement} target
 */
export function openModal(target) {
  const overlay = typeof target === 'string'
    ? document.getElementById(target.replace(/^#/, ''))
    : target;
  const inst = [...instances].find((item) => item.overlay === overlay);
  inst?.open();
  return inst;
}

/**
 * @param {string|HTMLElement} target
 */
export function closeModal(target) {
  const overlay = typeof target === 'string'
    ? document.getElementById(target.replace(/^#/, ''))
    : target;
  const inst = [...instances].find((item) => item.overlay === overlay);
  inst?.close();
  return inst;
}
