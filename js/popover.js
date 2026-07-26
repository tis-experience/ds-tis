/* ============================================================
   popover.js — runtime público para Popover

   Dialog contextual não modal. O runtime mantém aria-expanded,
   abertura/fechamento, foco, click externo e ciclo init/destroy.
   ============================================================ */

const instances = new Set();
let nextId = 0;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusable(panel) {
  return [...panel.querySelectorAll(FOCUSABLE_SELECTOR)]
    .filter((element) => element.getAttribute('aria-hidden') !== 'true');
}

function emit(root, name, detail) {
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function isInside(root, node) {
  return root === document || root === node || (typeof root.contains === 'function' && root.contains(node));
}

function createInstance(root) {
  if (root.closest('[inert]')) return null;

  const trigger = root.querySelector('.ds-popover__trigger, [data-ds-popover-trigger]');
  const panel = root.querySelector('.ds-popover__panel');
  if (!trigger || !panel) return null;

  const closeButtons = [...panel.querySelectorAll('.ds-popover__close, [data-ds-popover-close]')];
  const cleanups = [];
  let previousFocus = null;
  const placementClasses = ['bottom', 'top', 'left', 'right'];
  const preferredPlacement = placementClasses.find((placement) => (
    root.classList.contains(`ds-popover--${placement}`)
  )) || 'bottom';

  if (!panel.id) {
    nextId += 1;
    panel.id = `ds-popover-${nextId}`;
  }
  if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
  if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
  trigger.setAttribute('aria-controls', panel.id);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const setPlacement = (placement) => {
    for (const value of placementClasses) {
      root.classList.toggle(`ds-popover--${value}`, value === placement);
    }
    root.dataset.dsPopoverPlacement = placement;
  };

  const clearCollisionStyles = () => {
    panel.style.removeProperty('--popover-collision-inline');
    panel.style.removeProperty('--popover-collision-block');
    panel.style.removeProperty('max-inline-size');
    panel.style.removeProperty('max-block-size');
  };

  const constrainPanel = () => {
    clearCollisionStyles();
    if (panel.hidden) return;

    const view = panel.ownerDocument.defaultView;
    const styles = view.getComputedStyle(panel);
    const gutter = Number.parseFloat(styles.paddingInlineStart) || 0;
    const arrowGap = (Number.parseFloat(
      styles.getPropertyValue('--ds-popover-arrow-base-default'),
    ) || 0) / 2;
    const triggerRect = trigger.getBoundingClientRect();
    const available = {
      bottom: view.innerHeight - triggerRect.bottom - arrowGap - gutter,
      top: triggerRect.top - arrowGap - gutter,
      right: view.innerWidth - triggerRect.right - arrowGap - gutter,
      left: triggerRect.left - arrowGap - gutter,
    };
    const opposite = { bottom: 'top', top: 'bottom', left: 'right', right: 'left' };

    setPlacement(preferredPlacement);
    let rect = panel.getBoundingClientRect();
    const required = preferredPlacement === 'bottom' || preferredPlacement === 'top'
      ? rect.height
      : rect.width;
    const resolvedPlacement = available[preferredPlacement] < required
      && available[opposite[preferredPlacement]] > available[preferredPlacement]
      ? opposite[preferredPlacement]
      : preferredPlacement;
    setPlacement(resolvedPlacement);

    if (resolvedPlacement === 'bottom' || resolvedPlacement === 'top') {
      panel.style.maxBlockSize = `${Math.max(available[resolvedPlacement], 0)}px`;
    } else {
      panel.style.maxInlineSize = `${Math.max(available[resolvedPlacement], 0)}px`;
    }

    rect = panel.getBoundingClientRect();
    const maxRight = view.innerWidth - gutter;
    const maxBottom = view.innerHeight - gutter;

    let inlineShift = 0;
    let blockShift = 0;
    if (rect.left < gutter) inlineShift = gutter - rect.left;
    else if (rect.right > maxRight) inlineShift = maxRight - rect.right;
    if (rect.top < gutter) blockShift = gutter - rect.top;
    else if (rect.bottom > maxBottom) blockShift = maxBottom - rect.bottom;

    if (root.classList.contains('ds-popover--top') || root.classList.contains('ds-popover--bottom')) {
      if (inlineShift) panel.style.setProperty('--popover-collision-inline', `${inlineShift}px`);
    } else if (blockShift) {
      panel.style.setProperty('--popover-collision-block', `${blockShift}px`);
    }
  };

  const instance = {
    root,
    trigger,
    panel,
    open(reason = 'api') {
      if (!panel.hidden) return;
      previousFocus = document.activeElement;
      for (const other of instances) {
        if (other !== instance && !other.panel.hidden) {
          other.close('another-popover', { returnFocus: false });
        }
      }
      panel.hidden = false;
      root.dataset.open = 'true';
      trigger.setAttribute('aria-expanded', 'true');
      constrainPanel();
      const firstFocusable = getFocusable(panel)[0];
      (firstFocusable || panel).focus();
      emit(root, 'ds-popover-open', { root, trigger, panel, reason });
    },
    close(reason = 'api', options = {}) {
      if (panel.hidden) return;
      panel.hidden = true;
      setPlacement(preferredPlacement);
      clearCollisionStyles();
      delete root.dataset.open;
      trigger.setAttribute('aria-expanded', 'false');
      const returnFocus = options.returnFocus !== false;
      if (returnFocus && previousFocus instanceof HTMLElement) previousFocus.focus();
      previousFocus = null;
      if (options.emitEvent !== false) {
        emit(root, 'ds-popover-close', { root, trigger, panel, reason });
      }
    },
    toggle(reason = 'trigger') {
      if (panel.hidden) instance.open(reason);
      else instance.close(reason);
    },
    destroy() {
      instance.close('destroy', { returnFocus: false, emitEvent: false });
      while (cleanups.length) cleanups.pop()();
      delete root.dataset.dsPopoverInit;
      instances.delete(instance);
    },
  };

  on(trigger, 'click', (event) => {
    event.preventDefault();
    instance.toggle('trigger');
  });

  on(document, 'keydown', (event) => {
    if (event.key !== 'Escape' || panel.hidden) return;
    event.preventDefault();
    instance.close('escape');
  });

  on(document, 'pointerdown', (event) => {
    if (panel.hidden || root.contains(event.target)) return;
    instance.close('outside', {
      returnFocus: panel.contains(panel.ownerDocument.activeElement),
    });
  });

  on(panel.ownerDocument.defaultView, 'resize', constrainPanel);
  on(panel.ownerDocument.defaultView, 'scroll', constrainPanel, true);

  closeButtons.forEach((button) => {
    on(button, 'click', () => instance.close('close-button'));
  });

  return instance;
}

/**
 * Inicializa Popovers dentro de root.
 * @param {ParentNode} [root]
 */
export function initPopovers(root = document) {
  const created = [];
  const roots = [
    ...(root instanceof Element && root.matches('.ds-popover') ? [root] : []),
    ...root.querySelectorAll('.ds-popover'),
  ];

  for (const popoverRoot of roots) {
    if (popoverRoot.dataset.dsPopoverInit === 'true') continue;
    const instance = createInstance(popoverRoot);
    if (!instance) continue;
    popoverRoot.dataset.dsPopoverInit = 'true';
    instances.add(instance);
    created.push(instance);
  }

  return created;
}

/**
 * Remove listeners e estado de Popovers dentro de root.
 * @param {ParentNode} [root]
 */
export function destroyPopovers(root = document) {
  for (const instance of [...instances]) {
    if (isInside(root, instance.root)) instance.destroy();
  }
}

/**
 * Abre o Popover por root, panel ou id.
 * @param {string|HTMLElement} target
 */
export function openPopover(target) {
  const element = typeof target === 'string'
    ? document.getElementById(target.replace(/^#/, ''))
    : target;
  const instance = [...instances].find((item) => item.root === element || item.panel === element);
  instance?.open('api');
  return instance;
}

/**
 * Fecha o Popover por root, panel ou id.
 * @param {string|HTMLElement} target
 */
export function closePopover(target) {
  const element = typeof target === 'string'
    ? document.getElementById(target.replace(/^#/, ''))
    : target;
  const instance = [...instances].find((item) => item.root === element || item.panel === element);
  instance?.close('api');
  return instance;
}
