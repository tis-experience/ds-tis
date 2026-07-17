/* ============================================================
   combobox.js — runtime público para Combobox (required)

   O componente em css/components/combobox.css define anatomia e
   estados visuais; este módulo implementa abertura/fechamento do
   listbox, filtro, seleção e teclado. Use com a estrutura:

     <div class="ds-field">
       <label class="ds-field__label" for="id">…</label>
       <div class="ds-combobox-anchor">
         <div class="ds-combobox ds-combobox--md">…</div>
         <ul class="ds-combobox__listbox" hidden>…</ul>
       </div>
     </div>

   Ciclo de vida:
     const instances = initComboboxes(root);
     destroyComboboxes(root); // ou instance.destroy()
   ============================================================ */

const instances = new Set();
let generatedId = 0;

function closeAllExcept(current) {
  for (const inst of instances) {
    if (inst !== current) inst.close();
  }
}

function getOptions(listbox) {
  return Array.from(listbox.querySelectorAll('.ds-combobox__option'));
}

function ensureId(element, prefix) {
  if (!element.id) {
    generatedId += 1;
    element.id = `${prefix}-${generatedId}`;
  }
  return element.id;
}

/**
 * Sincroniza valor, estado filled e aria-selected das opções.
 * @param {HTMLElement} root - .ds-combobox-anchor ou .ds-field legado
 * @param {string} [value] - se omitido, lê do input
 */
export function syncComboboxState(root, value) {
  const input = root.querySelector('.ds-combobox__input');
  const combobox = root.querySelector('.ds-combobox');
  const listbox = root.querySelector('.ds-combobox__listbox');
  if (!input || !combobox || !listbox) return;

  const current = value != null ? value : input.value.trim();
  combobox.classList.toggle('ds-combobox--filled', current.length > 0);
  for (const opt of getOptions(listbox)) {
    opt.setAttribute('aria-selected', opt.textContent.trim() === current ? 'true' : 'false');
  }
}

function createInstance(root, { onChange } = {}) {
  const combobox = root.querySelector('.ds-combobox');
  const input = root.querySelector('.ds-combobox__input');
  const listbox = root.querySelector('.ds-combobox__listbox');
  if (!combobox || !input || !listbox) return null;

  const listboxId = ensureId(listbox, 'ds-combobox-listbox');
  input.setAttribute('aria-controls', listboxId);
  for (const opt of getOptions(listbox)) ensureId(opt, `${listboxId}-option`);

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const inst = {
    root,
    close() {
      listbox.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      combobox.classList.remove('ds-combobox--open');
      for (const opt of getOptions(listbox)) opt.removeAttribute('data-active');
    },
    open() {
      closeAllExcept(inst);
      listbox.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      combobox.classList.add('ds-combobox--open');
      filterOptions();
    },
    destroy() {
      inst.close();
      while (cleanups.length) cleanups.pop()();
      delete root.dataset.dsComboboxInit;
      instances.delete(inst);
    },
  };

  function filterOptions() {
    const query = input.value.trim().toLowerCase();
    for (const opt of getOptions(listbox)) {
      const label = opt.textContent.trim().toLowerCase();
      opt.hidden = query.length > 0 && !label.includes(query);
    }
  }

  function setActiveOption(option) {
    for (const opt of getOptions(listbox)) opt.removeAttribute('data-active');
    if (!option) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    option.setAttribute('data-active', 'true');
    input.setAttribute('aria-activedescendant', ensureId(option, `${listboxId}-option`));
  }

  function emitChange(option = null) {
    syncComboboxState(root);
    if (typeof onChange === 'function') onChange(input, root);
    input.dispatchEvent(new CustomEvent('ds-combobox-change', {
      bubbles: true,
      detail: {
        input,
        root,
        option,
        value: input.value,
      },
    }));
  }

  function selectOption(opt) {
    input.value = opt.textContent.trim();
    inst.close();
    emitChange(opt);
  }

  function visibleOptions() {
    return getOptions(listbox).filter((opt) => !opt.hidden);
  }

  on(input, 'focus', () => inst.open());

  on(input, 'input', () => {
    inst.open();
    emitChange();
  });

  on(input, 'change', () => emitChange());

  on(input, 'blur', () => {
    requestAnimationFrame(() => {
      if (!instances.has(inst)) return;
      if (!root.contains(document.activeElement)) inst.close();
    });
  });

  on(input, 'keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      inst.close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      inst.open();
      const visible = visibleOptions();
      const activeIndex = visible.findIndex((opt) => opt.getAttribute('data-active') === 'true');
      const next = visible[activeIndex < visible.length - 1 ? activeIndex + 1 : 0];
      setActiveOption(next);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      inst.open();
      const visible = visibleOptions();
      const activeIndex = visible.findIndex((opt) => opt.getAttribute('data-active') === 'true');
      const prev = visible[activeIndex > 0 ? activeIndex - 1 : visible.length - 1];
      setActiveOption(prev);
      return;
    }
    if (e.key === 'Enter') {
      const visible = visibleOptions();
      const active = visible.find((opt) => opt.getAttribute('data-active') === 'true');
      if (active) {
        e.preventDefault();
        selectOption(active);
      } else {
        inst.close();
        emitChange();
      }
    }
  });

  on(listbox, 'mousedown', (e) => {
    const opt = e.target.closest('.ds-combobox__option');
    if (opt && listbox.contains(opt)) {
      e.preventDefault();
      selectOption(opt);
    }
  });

  on(document, 'click', (e) => {
    if (!root.contains(e.target)) inst.close();
  });

  syncComboboxState(root);
  return inst;
}

function isInside(root, node) {
  return root === document || root === node || (typeof root.contains === 'function' && root.contains(node));
}

/**
 * Inicializa comboboxes dentro de `root`.
 * @param {ParentNode} [root]
 * @param {{ onChange?: (input: HTMLInputElement, root: HTMLElement) => void }} [opts]
 */
export function initComboboxes(root = document, opts = {}) {
  const created = [];

  const anchors = [
    ...(root instanceof Element && root.matches('.ds-combobox-anchor') ? [root] : []),
    ...root.querySelectorAll('.ds-combobox-anchor'),
  ];
  anchors.forEach((anchor) => {
    if (anchor.dataset.dsComboboxInit === 'true') return;
    const inst = createInstance(anchor, opts);
    if (inst) {
      anchor.dataset.dsComboboxInit = 'true';
      instances.add(inst);
      created.push(inst);
    }
  });

  const fields = [
    ...(root instanceof Element && root.matches('.ds-field') ? [root] : []),
    ...root.querySelectorAll('.ds-field'),
  ];
  fields.forEach((field) => {
    if (field.querySelector('.ds-combobox-anchor')) return;
    if (field.dataset.dsComboboxInit === 'true') return;
    if (!field.querySelector(':scope > .ds-combobox__listbox')) return;
    const inst = createInstance(field, opts);
    if (inst) {
      field.dataset.dsComboboxInit = 'true';
      instances.add(inst);
      created.push(inst);
    }
  });

  return created;
}

/**
 * @param {ParentNode} [root]
 */
export function destroyComboboxes(root = document) {
  for (const inst of [...instances]) {
    if (isInside(root, inst.root)) inst.destroy();
  }
}
