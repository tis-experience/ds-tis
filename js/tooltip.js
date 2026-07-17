/* ============================================================
   tooltip.js — runtime público para Tooltip (required)

   Anatomia e estados visuais: css/components/tooltip.css
   Uso:
     <div class="ds-tooltip ds-tooltip--top">
       <button type="button" aria-describedby="tip-1">…</button>
       <span class="ds-tooltip__content" id="tip-1" role="tooltip">…</span>
     </div>

   Ciclo de vida:
     const instances = initTooltips(root);
     destroyTooltips(root); // ou instance.destroy()

   WCAG 1.4.13: dismissible (Escape), hoverable (pointer no content),
   persistent enquanto hover/focus ativo.
   ============================================================ */

const instances = new Set();
const SHOW_DELAY_MS = 100;
const HIDE_DELAY_MS = 100;

function emit(root, name) {
  root.dispatchEvent(new CustomEvent(name, { bubbles: true }));
}

function getTrigger(root, content) {
  return [...root.children].find((child) => child !== content) || null;
}

function createInstance(root) {
  const content = root.querySelector(':scope > .ds-tooltip__content[role="tooltip"], :scope > .ds-tooltip__content');
  if (!content) return null;
  if (!content.hasAttribute('role')) content.setAttribute('role', 'tooltip');

  const trigger = getTrigger(root, content);
  if (!trigger) return null;

  if (!trigger.hasAttribute('aria-describedby') && content.id) {
    trigger.setAttribute('aria-describedby', content.id);
  }

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  let showTimer = null;
  let hideTimer = null;
  let open = root.dataset.open === 'true';
  let suppressUntilLeave = false;

  const clearTimers = () => {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  const inst = {
    root,
    show() {
      clearTimers();
      if (suppressUntilLeave || open) return;
      open = true;
      root.dataset.open = 'true';
      content.removeAttribute('hidden');
      emit(root, 'ds-tooltip-show');
    },
    hide() {
      clearTimers();
      if (!open) return;
      open = false;
      delete root.dataset.open;
      content.setAttribute('hidden', '');
      emit(root, 'ds-tooltip-hide');
    },
    scheduleShow() {
      clearTimers();
      if (suppressUntilLeave || open) return;
      showTimer = setTimeout(() => {
        showTimer = null;
        inst.show();
      }, SHOW_DELAY_MS);
    },
    scheduleHide() {
      clearTimers();
      if (!open) return;
      hideTimer = setTimeout(() => {
        hideTimer = null;
        if (root.contains(document.activeElement)) return;
        inst.hide();
      }, HIDE_DELAY_MS);
    },
    destroy() {
      clearTimers();
      if (open) {
        open = false;
        delete root.dataset.open;
        content.setAttribute('hidden', '');
      }
      while (cleanups.length) cleanups.pop()();
      delete root.dataset.dsTooltipInit;
      instances.delete(inst);
    },
  };

  // Start closed unless the markup already requests open (static docs demos).
  if (root.dataset.open === 'true') {
    open = true;
    content.removeAttribute('hidden');
  } else {
    open = false;
    content.setAttribute('hidden', '');
  }

  on(root, 'pointerenter', () => {
    suppressUntilLeave = false;
    inst.scheduleShow();
  });
  on(root, 'pointerleave', () => {
    suppressUntilLeave = false;
    inst.scheduleHide();
  });

  on(trigger, 'focusin', () => {
    if (!suppressUntilLeave) inst.show();
  });
  on(trigger, 'focusout', () => {
    requestAnimationFrame(() => {
      if (!instances.has(inst)) return;
      if (root.contains(document.activeElement)) return;
      suppressUntilLeave = false;
      inst.scheduleHide();
    });
  });

  on(document, 'keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      suppressUntilLeave = true;
      inst.hide();
    }
  });

  return inst;
}

function isInside(root, node) {
  return root === document || root === node || (typeof root.contains === 'function' && root.contains(node));
}

/**
 * @param {ParentNode} [root]
 */
export function initTooltips(root = document) {
  const created = [];

  root.querySelectorAll('.ds-tooltip').forEach((tooltip) => {
    if (tooltip.dataset.dsTooltipInit === 'true') return;
    if (tooltip.closest('[inert]')) return;
    tooltip.dataset.dsTooltipInit = 'true';
    const inst = createInstance(tooltip);
    if (inst) {
      instances.add(inst);
      created.push(inst);
    }
  });

  return created;
}

/**
 * @param {ParentNode} [root]
 */
export function destroyTooltips(root = document) {
  for (const inst of [...instances]) {
    if (isInside(root, inst.root)) inst.destroy();
  }
}

/**
 * @param {HTMLElement} root
 */
export function showTooltip(root) {
  const inst = [...instances].find((item) => item.root === root);
  inst?.show();
  return inst;
}

/**
 * @param {HTMLElement} root
 */
export function hideTooltip(root) {
  const inst = [...instances].find((item) => item.root === root);
  inst?.hide();
  return inst;
}
