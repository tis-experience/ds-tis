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
let generatedId = 0;

function emit(root, name, detail) {
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
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

  if (!content.id) {
    do {
      generatedId += 1;
      content.id = `ds-tooltip-${generatedId}`;
    } while (content.ownerDocument.getElementById(content.id) !== content);
  }

  const describedBy = (trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  if (!describedBy.includes(content.id)) {
    trigger.setAttribute('aria-describedby', [...describedBy, content.id].join(' '));
  }

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  let showTimer = null;
  let hideTimer = null;
  let focusFrame = null;
  let open = root.dataset.open === 'true';
  let suppressUntilLeave = false;
  const view = root.ownerDocument.defaultView;

  const clearTimers = () => {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (focusFrame) {
      view.cancelAnimationFrame(focusFrame);
      focusFrame = null;
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
      emit(root, 'ds-tooltip-show', { root, trigger, content });
    },
    hide() {
      clearTimers();
      if (!open) return;
      open = false;
      delete root.dataset.open;
      content.setAttribute('hidden', '');
      emit(root, 'ds-tooltip-hide', { root, trigger, content });
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
        if (root.contains(root.ownerDocument.activeElement)) return;
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
    if (focusFrame) view.cancelAnimationFrame(focusFrame);
    focusFrame = view.requestAnimationFrame(() => {
      focusFrame = null;
      if (!instances.has(inst)) return;
      if (root.contains(root.ownerDocument.activeElement)) return;
      suppressUntilLeave = false;
      inst.scheduleHide();
    });
  });

  on(root.ownerDocument, 'keydown', (e) => {
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
  const tooltips = [];

  if (root instanceof Element && root.matches('.ds-tooltip')) tooltips.push(root);
  if (typeof root.querySelectorAll === 'function') {
    tooltips.push(...root.querySelectorAll('.ds-tooltip'));
  }

  tooltips.forEach((tooltip) => {
    if (tooltip.dataset.dsTooltipInit === 'true') return;
    if (tooltip.closest('[inert]')) return;
    const inst = createInstance(tooltip);
    if (inst) {
      tooltip.dataset.dsTooltipInit = 'true';
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
