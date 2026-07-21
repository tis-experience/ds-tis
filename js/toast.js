/* ============================================================
   toast.js — runtime público para Toast (required)

   Anatomia: css/components/toast.css
   Uso:
     initToasts();
     const id = showToast({ type: 'success', title: 'Salvo' });
     dismissToast(id);

   Ciclo de vida:
     initToasts(root?) / destroyToasts(root?)
     Eventos: ds-toast-show | ds-toast-dismiss | ds-toast-action
   ============================================================ */

const instances = new Set();
const DEFAULT_DURATION_MS = 5000;
const MAX_VISIBLE = 5;
const ICONS = {
  success: 'circle-check',
  warning: 'triangle-alert',
  error: 'circle-alert',
  info: 'info',
};

let generatedId = 0;
let activeController = null;

function emit(target, name, detail) {
  target.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function normalizeType(type) {
  const value = String(type || 'info').toLowerCase();
  return ICONS[value] ? value : 'info';
}

function ensureRegion(doc = document) {
  let region = doc.querySelector('[data-ds-toast-region], .ds-toast-region');
  if (!region) {
    region = doc.createElement('div');
    region.className = 'ds-toast-region';
    region.setAttribute('data-ds-toast-region', '');
    doc.body.appendChild(region);
  }

  let polite = region.querySelector(':scope > .ds-toast-region__polite');
  if (!polite) {
    polite = doc.createElement('div');
    polite.className = 'ds-toast-region__polite';
    polite.setAttribute('role', 'status');
    polite.setAttribute('aria-live', 'polite');
    polite.setAttribute('aria-relevant', 'additions');
    region.appendChild(polite);
  }

  let assertive = region.querySelector(':scope > .ds-toast-region__assertive');
  if (!assertive) {
    assertive = doc.createElement('div');
    assertive.className = 'ds-toast-region__assertive';
    assertive.setAttribute('role', 'alert');
    assertive.setAttribute('aria-live', 'assertive');
    assertive.setAttribute('aria-relevant', 'additions');
    region.appendChild(assertive);
  }

  return { region, polite, assertive };
}

function createIcon(doc, name) {
  const wrap = doc.createElement('span');
  wrap.className = 'ds-toast__icon';
  wrap.setAttribute('aria-hidden', 'true');
  const icon = doc.createElement('i');
  icon.className = 'ds-icon';
  icon.setAttribute('data-lucide', name);
  wrap.appendChild(icon);
  return wrap;
}

function createCloseButton(doc) {
  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = 'ds-toast__close';
  btn.setAttribute('aria-label', 'Dispensar');
  const icon = doc.createElement('i');
  icon.className = 'ds-icon';
  icon.setAttribute('data-lucide', 'x');
  icon.setAttribute('aria-hidden', 'true');
  btn.appendChild(icon);
  return btn;
}

function createController(doc = document) {
  const { region, polite, assertive } = ensureRegion(doc);
  const toasts = new Map();
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const dismiss = (id, reason = 'dismiss') => {
    const entry = toasts.get(id);
    if (!entry) return false;
    entry.clearTimer();
    entry.el.remove();
    toasts.delete(id);
    emit(region, 'ds-toast-dismiss', { id, type: entry.type, reason, root: region, toast: entry.el });
    return true;
  };

  const enforceLimit = () => {
    while (toasts.size > MAX_VISIBLE) {
      const oldestId = toasts.keys().next().value;
      dismiss(oldestId, 'overflow');
    }
  };

  const show = (options = {}) => {
    const type = normalizeType(options.type);
    const style = String(options.style || 'subtle').toLowerCase() === 'solid' ? 'solid' : 'subtle';
    const title = options.title != null ? String(options.title) : '';
    if (!title) throw new Error('showToast requires options.title');

    generatedId += 1;
    const id = options.id != null ? String(options.id) : `ds-toast-${generatedId}`;
    if (toasts.has(id)) dismiss(id, 'replace');

    const actions = [];
    if (Array.isArray(options.actions)) {
      for (const item of options.actions.slice(0, 2)) {
        if (!item || item.label == null || String(item.label) === '') continue;
        actions.push({
          label: String(item.label),
          onAction: typeof item.onAction === 'function' ? item.onAction : null,
        });
      }
    } else if (options.actionLabel) {
      actions.push({
        label: String(options.actionLabel),
        onAction: typeof options.onAction === 'function' ? options.onAction : null,
      });
    }

    const hasAction = actions.length > 0;
    const duration = options.duration != null
      ? Number(options.duration)
      : (hasAction ? Infinity : DEFAULT_DURATION_MS);

    const el = doc.createElement('div');
    el.className = `ds-toast ds-toast--${type} ds-toast--${style}`;
    el.setAttribute('data-ds-toast', '');
    el.dataset.toastId = id;
    el.dataset.type = type;
    el.dataset.style = style;

    el.appendChild(createIcon(doc, ICONS[type]));

    const content = doc.createElement('div');
    content.className = 'ds-toast__content';
    const titleEl = doc.createElement('p');
    titleEl.className = 'ds-toast__title';
    titleEl.textContent = title;
    content.appendChild(titleEl);
    if (options.description) {
      const descEl = doc.createElement('p');
      descEl.className = 'ds-toast__description';
      descEl.textContent = String(options.description);
      content.appendChild(descEl);
    }

    if (hasAction) {
      const actionsEl = doc.createElement('div');
      actionsEl.className = 'ds-toast__actions';
      actions.forEach((action, index) => {
        const actionBtn = doc.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'ds-button ds-button--ghost ds-button--sm';
        const label = doc.createElement('span');
        label.className = 'ds-button__label';
        label.textContent = action.label;
        actionBtn.appendChild(label);
        actionsEl.appendChild(actionBtn);
        on(actionBtn, 'click', () => {
          emit(region, 'ds-toast-action', {
            id,
            type,
            actionIndex: index,
            label: action.label,
            root: region,
            toast: el,
          });
          if (action.onAction) action.onAction({ id, type, actionIndex: index, label: action.label, toast: el });
        });
      });
      content.appendChild(actionsEl);
    }

    el.appendChild(content);

    const closeBtn = createCloseButton(doc);
    el.appendChild(closeBtn);

    const host = type === 'error' ? assertive : polite;
    host.prepend(el);

    let timer = null;
    let remaining = Number.isFinite(duration) ? duration : null;
    let startedAt = null;
    let paused = false;

    const clearTimer = () => {
      if (timer) {
        doc.defaultView.clearTimeout(timer);
        timer = null;
      }
      startedAt = null;
    };

    const schedule = () => {
      clearTimer();
      if (remaining == null || !Number.isFinite(remaining) || remaining <= 0) return;
      startedAt = Date.now();
      timer = doc.defaultView.setTimeout(() => {
        timer = null;
        dismiss(id, 'timeout');
      }, remaining);
    };

    const pause = () => {
      if (paused || remaining == null) return;
      paused = true;
      if (startedAt != null) {
        remaining = Math.max(0, remaining - (Date.now() - startedAt));
      }
      clearTimer();
    };

    const resume = () => {
      if (!paused) return;
      paused = false;
      schedule();
    };

    const entry = { id, type, el, clearTimer, pause, resume };
    toasts.set(id, entry);

    on(closeBtn, 'click', () => dismiss(id, 'close'));
    on(el, 'mouseenter', pause);
    on(el, 'mouseleave', resume);
    on(el, 'focusin', pause);
    on(el, 'focusout', (event) => {
      if (!el.contains(event.relatedTarget)) resume();
    });

    enforceLimit();
    schedule();
    emit(region, 'ds-toast-show', { id, type, style, root: region, toast: el });
    return id;
  };

  const onKeydown = (event) => {
    if (event.key !== 'Escape') return;
    const active = doc.activeElement;
    if (!active || !region.contains(active)) return;
    const toast = active.closest('[data-ds-toast]');
    if (!toast) return;
    event.preventDefault();
    dismiss(toast.dataset.toastId, 'escape');
  };
  on(doc, 'keydown', onKeydown);

  region.dataset.dsToastInit = 'true';

  const controller = {
    root: region,
    show,
    dismiss,
    destroy() {
      for (const id of [...toasts.keys()]) dismiss(id, 'destroy');
      for (const off of cleanups) off();
      cleanups.length = 0;
      delete region.dataset.dsToastInit;
      if (activeController === controller) activeController = null;
      instances.delete(controller);
    },
  };

  instances.add(controller);
  return controller;
}

export function initToasts(root = document) {
  const doc = root?.ownerDocument || root || document;
  if (activeController && activeController.root.isConnected) {
    return [activeController];
  }
  activeController = createController(doc);
  return [activeController];
}

export function destroyToasts(root = document) {
  const doc = root?.ownerDocument || root || document;
  const region = doc.querySelector('[data-ds-toast-region], .ds-toast-region');
  for (const inst of [...instances]) {
    if (!root || root === doc || root === document || root.contains(inst.root) || inst.root === root || inst.root === region) {
      inst.destroy();
    }
  }
  if (activeController && (!activeController.root.isConnected || activeController.root === region)) {
    activeController = null;
  }
}

export function showToast(options) {
  if (!activeController || !activeController.root.isConnected) {
    initToasts(document);
  }
  return activeController.show(options);
}

export function dismissToast(id) {
  if (!activeController) return false;
  return activeController.dismiss(String(id), 'api');
}
