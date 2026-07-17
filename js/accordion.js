/* ============================================================
   accordion.js — runtime público para Accordion (required)

   Anatomia e estados visuais: css/components/accordion.css
   Uso:
     <div class="ds-accordion" data-accordion-mode="single">
       <div class="ds-accordion__item" data-state="closed">
         <button class="ds-accordion__trigger" type="button"
                 aria-expanded="false" aria-controls="panel-1">…</button>
         <div class="ds-accordion__panel" id="panel-1" role="region" hidden>…</div>
       </div>
     </div>

   Ciclo de vida:
     const instances = initAccordions(root);
     destroyAccordions(root); // ou instance.destroy()
   ============================================================ */

const instances = new Set();

function getTriggers(accordion) {
  return [...accordion.querySelectorAll('.ds-accordion__trigger[aria-controls]')].filter(
    (trigger) => trigger.closest('.ds-accordion') === accordion,
  );
}

function emit(accordion, name, detail) {
  accordion.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function setItemState(trigger, expanded) {
  const panelId = trigger.getAttribute('aria-controls');
  const panel = panelId ? document.getElementById(panelId) : null;
  const item = trigger.closest('.ds-accordion__item');

  trigger.setAttribute('aria-expanded', String(expanded));
  if (panel) panel.hidden = !expanded;
  if (item) item.setAttribute('data-state', expanded ? 'open' : 'closed');

  return { item, panel };
}

function createInstance(accordion) {
  const triggers = getTriggers(accordion);
  if (!triggers.length) return null;

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const inst = {
    root: accordion,
    open(trigger) {
      if (!trigger || !triggers.includes(trigger)) return;
      if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
      if (trigger.getAttribute('aria-expanded') === 'true') return;

      if (accordion.getAttribute('data-accordion-mode') === 'single') {
        for (const other of triggers) {
          if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
            const closed = setItemState(other, false);
            emit(accordion, 'ds-accordion-close', { trigger: other, ...closed });
          }
        }
      }

      const opened = setItemState(trigger, true);
      emit(accordion, 'ds-accordion-open', { trigger, ...opened });
    },
    close(trigger) {
      if (!trigger || !triggers.includes(trigger)) return;
      if (trigger.getAttribute('aria-expanded') !== 'true') return;
      const closed = setItemState(trigger, false);
      emit(accordion, 'ds-accordion-close', { trigger, ...closed });
    },
    toggle(trigger) {
      if (!trigger || !triggers.includes(trigger)) return;
      if (trigger.getAttribute('aria-expanded') === 'true') inst.close(trigger);
      else inst.open(trigger);
    },
    destroy() {
      while (cleanups.length) cleanups.pop()();
      delete accordion.dataset.dsAccordionInit;
      instances.delete(inst);
    },
  };

  function moveFocus(current, direction) {
    const currentIndex = triggers.indexOf(current);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'first'
      ? 0
      : direction === 'last'
        ? triggers.length - 1
        : (currentIndex + direction + triggers.length) % triggers.length;

    triggers[nextIndex].focus();
  }

  for (const trigger of triggers) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    const expanded = trigger.getAttribute('aria-expanded') === 'true' && !(panel && panel.hidden);
    setItemState(trigger, expanded);

    on(trigger, 'click', () => {
      if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
      inst.toggle(trigger);
    });

    on(trigger, 'keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        moveFocus(trigger, 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        moveFocus(trigger, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        moveFocus(trigger, 'first');
      } else if (e.key === 'End') {
        e.preventDefault();
        moveFocus(trigger, 'last');
      }
    });
  }

  return inst;
}

function isInside(root, node) {
  return root === document || root === node || (typeof root.contains === 'function' && root.contains(node));
}

function getAccordions(root) {
  const accordions = [];
  if (root?.matches?.('.ds-accordion')) accordions.push(root);
  if (typeof root?.querySelectorAll === 'function') {
    accordions.push(...root.querySelectorAll('.ds-accordion'));
  }
  return accordions;
}

/**
 * @param {ParentNode} [root]
 */
export function initAccordions(root = document) {
  const created = [];

  getAccordions(root).forEach((accordion) => {
    if (accordion.dataset.dsAccordionInit === 'true') return;
    const inst = createInstance(accordion);
    if (inst) {
      accordion.dataset.dsAccordionInit = 'true';
      instances.add(inst);
      created.push(inst);
    }
  });

  return created;
}

/**
 * @param {ParentNode} [root]
 */
export function destroyAccordions(root = document) {
  for (const inst of [...instances]) {
    if (isInside(root, inst.root)) inst.destroy();
  }
}

/**
 * @param {HTMLElement} trigger
 */
export function openAccordionItem(trigger) {
  const accordion = trigger?.closest?.('.ds-accordion');
  const inst = [...instances].find((item) => item.root === accordion);
  inst?.open(trigger);
  return inst;
}

/**
 * @param {HTMLElement} trigger
 */
export function closeAccordionItem(trigger) {
  const accordion = trigger?.closest?.('.ds-accordion');
  const inst = [...instances].find((item) => item.root === accordion);
  inst?.close(trigger);
  return inst;
}
