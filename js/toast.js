/* ============================================================
   toast.js — runtime público para Toast

   Ciclo de vida:
   initToasts(root?) / destroyToasts(root?)
   showToast(options) / dismissToast(id)

   Eventos:
   ds-toast-show | ds-toast-dismiss | ds-toast-action
   ============================================================ */

const controllers = new Set();
const DEFAULT_DURATION_MS = 5000;
const MIN_ACTION_DURATION_MS = 10000;
const MAX_VISIBLE = 5;
const ICONS = {
  success: 'circle-check',
  warning: 'triangle-alert',
  error: 'circle-alert',
  info: 'info',
};

let generatedId = 0;
let activeController = null;

function getDocument(root) {
  if (root?.nodeType === 9) return root;
  return root?.ownerDocument || document;
}

function emit(target, name, detail) {
  const EventConstructor = target.ownerDocument.defaultView.CustomEvent;
  target.dispatchEvent(new EventConstructor(name, { bubbles: true, detail }));
}

function normalizeType(type) {
  const value = String(type || 'info').toLowerCase();
  return ICONS[value] ? value : 'info';
}

function normalizeStyle(style) {
  return String(style || 'subtle').toLowerCase() === 'solid' ? 'solid' : 'subtle';
}

function normalizeDuration(value, hasAction) {
  if (value == null) return hasAction ? null : DEFAULT_DURATION_MS;
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return hasAction ? Math.max(duration, MIN_ACTION_DURATION_MS) : duration;
}

function ensureRegion(root) {
  const doc = getDocument(root);
  const scope = root?.nodeType === 1 ? root : doc;
  const regionSelector = '[data-ds-toast-region], .ds-toast-region';
  let region = scope.nodeType === 1 && scope.matches(regionSelector)
    ? scope
    : scope.querySelector(regionSelector);
  let regionCreated = false;

  if (!region) {
    region = doc.createElement('div');
    region.className = 'ds-toast-region';
    region.setAttribute('data-ds-toast-region', '');
    (scope === doc ? doc.body : scope).appendChild(region);
    regionCreated = true;
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

  return { doc, region, polite, assertive, regionCreated };
}

function createIcon(doc, name) {
  const wrapper = doc.createElement('span');
  wrapper.className = 'ds-toast__icon';
  wrapper.setAttribute('aria-hidden', 'true');

  const icon = doc.createElement('i');
  icon.className = 'ds-icon';
  icon.setAttribute('data-lucide', name);
  wrapper.appendChild(icon);

  return wrapper;
}

function createCloseButton(doc, label) {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'ds-toast__close';
  button.setAttribute('aria-label', label);

  const icon = doc.createElement('i');
  icon.className = 'ds-icon';
  icon.setAttribute('data-lucide', 'x');
  icon.setAttribute('aria-hidden', 'true');
  button.appendChild(icon);

  return button;
}

function renderLucideIcons(doc) {
  const lucide = doc.defaultView.lucide;
  if (!lucide?.createIcons) return;
  lucide.createIcons({
    icons: lucide.icons,
    attrs: { 'aria-hidden': 'true' },
  });
}

function createController(root) {
  const {
    doc,
    region,
    polite,
    assertive,
    regionCreated,
  } = ensureRegion(root);
  const toasts = new Map();
  const controllerCleanups = [];

  const on = (target, type, handler, options, cleanups = controllerCleanups) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const dismiss = (id, reason = 'dismiss') => {
    const entry = toasts.get(String(id));
    if (!entry) return false;

    entry.clearTimer();
    for (const cleanup of entry.cleanups) cleanup();
    entry.cleanups.length = 0;
    entry.element.remove();
    toasts.delete(entry.id);

    emit(region, 'ds-toast-dismiss', {
      id: entry.id,
      type: entry.type,
      reason,
      root: region,
      toast: entry.element,
    });
    return true;
  };

  const enforceLimit = () => {
    while (toasts.size > MAX_VISIBLE) {
      dismiss(toasts.keys().next().value, 'overflow');
    }
  };

  const show = (options = {}) => {
    const type = normalizeType(options.type);
    const style = normalizeStyle(options.style);
    const title = options.title == null ? '' : String(options.title).trim();
    if (!title) throw new Error('showToast requires options.title');

    generatedId += 1;
    const id = options.id == null ? `ds-toast-${generatedId}` : String(options.id);
    if (toasts.has(id)) dismiss(id, 'replace');

    const actions = [];
    if (Array.isArray(options.actions)) {
      for (const item of options.actions.slice(0, 2)) {
        if (!item || item.label == null || !String(item.label).trim()) continue;
        actions.push({
          label: String(item.label),
          onAction: typeof item.onAction === 'function' ? item.onAction : null,
        });
      }
    } else if (options.actionLabel != null && String(options.actionLabel).trim()) {
      actions.push({
        label: String(options.actionLabel),
        onAction: typeof options.onAction === 'function' ? options.onAction : null,
      });
    }

    const duration = normalizeDuration(options.duration, actions.length > 0);
    const element = doc.createElement('div');
    element.className = `ds-toast ds-toast--${type} ds-toast--${style}`;
    element.setAttribute('data-ds-toast', '');
    element.dataset.toastId = id;
    element.dataset.type = type;
    element.dataset.style = style;
    element.appendChild(createIcon(doc, ICONS[type]));

    const content = doc.createElement('div');
    content.className = 'ds-toast__content';

    const titleElement = doc.createElement('p');
    titleElement.className = 'ds-toast__title';
    titleElement.textContent = title;
    content.appendChild(titleElement);

    if (options.description != null && String(options.description)) {
      const description = doc.createElement('p');
      description.className = 'ds-toast__description';
      description.textContent = String(options.description);
      content.appendChild(description);
    }

    const entryCleanups = [];
    if (actions.length) {
      const actionsElement = doc.createElement('div');
      actionsElement.className = 'ds-toast__actions';

      actions.forEach((action, actionIndex) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.className = 'ds-button ds-button--ghost ds-button--sm';

        const label = doc.createElement('span');
        label.className = 'ds-button__label';
        label.textContent = action.label;
        button.appendChild(label);
        actionsElement.appendChild(button);

        on(button, 'click', () => {
          const detail = {
            id,
            type,
            actionIndex,
            label: action.label,
            root: region,
            toast: element,
          };
          emit(region, 'ds-toast-action', detail);
          action.onAction?.(detail);
        }, undefined, entryCleanups);
      });

      content.appendChild(actionsElement);
    }

    element.appendChild(content);
    const closeButton = createCloseButton(
      doc,
      options.dismissLabel == null ? 'Dispensar' : String(options.dismissLabel),
    );
    element.appendChild(closeButton);

    const host = type === 'error' ? assertive : polite;
    host.prepend(element);
    renderLucideIcons(doc);

    let timer = null;
    let remaining = duration;
    let startedAt = null;
    let paused = false;

    const clearTimer = () => {
      if (timer != null) {
        doc.defaultView.clearTimeout(timer);
        timer = null;
      }
      startedAt = null;
    };

    const schedule = () => {
      clearTimer();
      if (remaining == null || remaining <= 0) return;
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

    const entry = {
      id,
      type,
      element,
      cleanups: entryCleanups,
      clearTimer,
    };
    toasts.set(id, entry);

    on(closeButton, 'click', () => dismiss(id, 'close'), undefined, entryCleanups);
    on(element, 'mouseenter', pause, undefined, entryCleanups);
    on(element, 'mouseleave', resume, undefined, entryCleanups);
    on(element, 'focusin', pause, undefined, entryCleanups);
    on(element, 'focusout', (event) => {
      if (!element.contains(event.relatedTarget)) resume();
    }, undefined, entryCleanups);

    enforceLimit();
    schedule();
    emit(region, 'ds-toast-show', {
      id,
      type,
      style,
      root: region,
      toast: element,
    });
    return id;
  };

  const onKeydown = (event) => {
    if (event.key !== 'Escape') return;
    const activeElement = doc.activeElement;
    if (!activeElement || !region.contains(activeElement)) return;
    const toast = activeElement.closest('[data-ds-toast]');
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
      for (const cleanup of controllerCleanups) cleanup();
      controllerCleanups.length = 0;
      delete region.dataset.dsToastInit;
      if (regionCreated) region.remove();
      if (activeController === controller) activeController = null;
      controllers.delete(controller);
    },
  };

  controllers.add(controller);
  return controller;
}

export function initToasts(root = document) {
  const doc = getDocument(root);
  const scope = root?.nodeType === 1 ? root : doc;
  const regionSelector = '[data-ds-toast-region], .ds-toast-region';
  const region = scope.nodeType === 1 && scope.matches(regionSelector)
    ? scope
    : scope.querySelector(regionSelector);
  const existing = [...controllers].find((controller) => (
    controller.root.isConnected
    && (controller.root === region || scope.contains(controller.root))
  ));

  if (existing) {
    activeController = existing;
    return [existing];
  }

  activeController = createController(root);
  return [activeController];
}

export function destroyToasts(root = document) {
  const doc = getDocument(root);
  const scope = root?.nodeType === 1 ? root : doc;
  for (const controller of [...controllers]) {
    if (
      controller.root === scope
      || scope.contains(controller.root)
      || (scope === doc && controller.root.ownerDocument === doc)
    ) {
      controller.destroy();
    }
  }
}

export function showToast(options) {
  if (!activeController?.root.isConnected) {
    [activeController] = initToasts(document);
  }
  return activeController.show(options);
}

export function dismissToast(id) {
  return activeController ? activeController.dismiss(String(id), 'api') : false;
}
