/* ============================================================
   MAIN.JS — Documentation Site Interactivity
   ============================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     Navigation — single source of truth for the sidebar
     --------------------------------------------------------- */
  var NAV_DATA = [
    {
      heading: 'Overview',
      items: [
        { label: 'Getting Started', path: 'index.html' },
        { label: 'Token Architecture', path: 'docs/token-architecture.html' },
        { label: 'Design Principles', path: 'docs/design-principles.html' },
        { label: 'Changelog', path: 'docs/changelog.html' }
      ]
    },
    {
      heading: 'Foundations',
      items: [
        { label: 'Overview',      path: 'docs/foundations.html' },
        { label: 'Colors',        path: 'docs/foundations-colors.html' },
        { label: 'Theme Colors',  path: 'docs/foundations-theme-colors.html' },
        { label: 'Typography',    path: 'docs/foundations-typography.html' },
        { label: 'Icons',         path: 'docs/icons.html' },
        { label: 'Spacing',       path: 'docs/foundations-spacing.html' },
        { label: 'Radius',        path: 'docs/foundations-radius.html' },
        { label: 'Elevation',     path: 'docs/foundations-elevation.html' },
        { label: 'Borders',       path: 'docs/foundations-borders.html' },
        { label: 'Motion',        path: 'docs/foundations-motion.html' },
        { label: 'Opacity',       path: 'docs/foundations-opacity.html' },
        { label: 'Z-index',       path: 'docs/foundations-zindex.html' }
      ]
    },
    {
      heading: 'Components',
      items: [
        { label: 'Accordion',  path: 'docs/accordion.html' },
        { label: 'Alert',      path: 'docs/alert.html' },
        { label: 'Avatar',     path: 'docs/avatar.html' },
        { label: 'Badge',      path: 'docs/badge.html' },
        { label: 'Breadcrumb', path: 'docs/breadcrumb.html' },
        { label: 'Button',     path: 'docs/button.html' },
        { label: 'Card',       path: 'docs/card.html' },
        { label: 'Divider',    path: 'docs/divider.html' },
        {
          label: 'Form',
          children: [
            { label: 'Checkbox',   path: 'docs/checkbox.html' },
            { label: 'Combobox',   path: 'docs/combobox.html' },
            { label: 'Form Field', path: 'docs/form-field.html' },
            { label: 'Input',      path: 'docs/input.html' },
            { label: 'Radio',      path: 'docs/radio.html' },
            { label: 'Select',     path: 'docs/select.html' },
            { label: 'Textarea',   path: 'docs/textarea.html' },
            { label: 'Toggle',     path: 'docs/toggle.html' }
          ]
        },
        { label: 'Menu',       path: 'docs/menu.html' },
        { label: 'Modal',      path: 'docs/modal.html' },
        { label: 'Pagination', path: 'docs/pagination.html' },
        { label: 'Skeleton',   path: 'docs/skeleton.html' },
        { label: 'Spinner',    path: 'docs/spinner.html' },
        { label: 'Tabs',       path: 'docs/tabs.html' },
        { label: 'Tooltip',    path: 'docs/tooltip.html' }
      ]
    },
    {
      heading: 'Templates',
      items: [
        { label: 'Overview',   path: 'docs/templates/index.html' },
        { label: 'Login',      path: 'docs/templates/login.html' },
        { label: 'Sign Up',    path: 'docs/templates/signup.html' },
        { label: 'Dashboard',  path: 'docs/templates/dashboard.html' },
        { label: 'Settings',   path: 'docs/templates/settings.html' },
        { label: 'Contact',    path: 'docs/templates/contact.html' }
      ]
    },
    {
      heading: 'Guidelines',
      items: [
        { label: 'Theming',        path: 'docs/theming.html' },
        { label: 'Accessibility',  path: 'docs/accessibility.html' },
        { label: 'Control Sizing', path: 'docs/control-sizing.html' },
        { label: 'Documentation',  path: 'docs/documentation-guidelines.html' }
      ]
    },
    {
      heading: 'Decisions',
      items: [
        { label: 'Overview',       path: 'docs/decisions/index.html' }
      ]
    },
    {
      heading: 'Process',
      items: [
        { label: 'Contributing',   path: 'docs/process-contributing.html' },
        { label: 'Versioning',     path: 'docs/process-versioning.html' },
        { label: 'Releasing',      path: 'docs/process-releasing.html' },
        { label: 'Backlog',        path: 'docs/backlog.html' },
        { label: 'Tokens sync',    path: 'docs/tokens-sync.html' }
      ]
    },
    {
      heading: 'Brand',
      items: [
        { label: 'Brand Principles', path: 'docs/brand-principles.html' }
      ]
    }
  ];

  function buildSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Deriva o caminho atual relativo à raiz do site (mesma forma do NAV_DATA),
    // para que a comparação de item ativo funcione sem colisão entre páginas
    // com o mesmo nome de arquivo em diretórios diferentes (ex: index.html
    // na raiz vs docs/decisions/index.html).
    var pathname = window.location.pathname;
    var segments = pathname.split('/').filter(Boolean);
    var fileName = segments.pop() || 'index.html';
    var docsIdx  = segments.indexOf('docs');
    var currentPath, depth;
    if (docsIdx === -1) {
      // Raiz do site (eventualmente dentro de um basepath do GitHub Pages).
      currentPath = fileName;
      depth = 0;
    } else {
      var relDirs = segments.slice(docsIdx);
      currentPath = relDirs.concat([fileName]).join('/');
      depth = relDirs.length;
    }
    var upToRoot = depth === 0 ? '' : '../'.repeat(depth);

    // Estado de expand/collapse persiste entre navegações em localStorage.
    // Default: aberto (true) pra todas as sections e groups. Usuário só
    // explicita preferência quando colapsa algo. Reset state apagando a key.
    var STATE_KEY = 'ds-sidebar-state';
    function loadState() {
      try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {}; }
      catch { return {}; }
    }
    function saveState(state) {
      try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
      catch { /* storage cheio ou disabled — ignora */ }
    }
    function isExpandedDefault(key) {
      var state = loadState();
      // Default true (aberto) quando não há preferência salva.
      return state[key] === undefined ? true : state[key] === true;
    }

    function renderLeafItem(item) {
      var href = upToRoot + item.path;
      var active = item.path === currentPath ? ' ds-sidebar__link--active' : '';
      return '<li><a href="' + href + '" class="ds-sidebar__link' + active + '">'
        + item.label + '</a></li>';
    }

    function renderItem(item) {
      if (item.children) {
        var hasActiveChild = item.children.some(function (c) { return c.path === currentPath; });
        var stateKey = 'group:' + item.label;
        // Auto-expand se houver child ativo (override do estado salvo) OR
        // se preferência salva (default true) é aberto.
        var expanded = hasActiveChild || isExpandedDefault(stateKey);
        var childrenHtml = item.children.map(renderLeafItem).join('');
        var expandedClass = expanded ? ' ds-sidebar__group--expanded' : '';
        return '<li class="ds-sidebar__group' + expandedClass + '" data-state-key="' + stateKey + '">'
          + '<button class="ds-sidebar__group-toggle" aria-expanded="' + expanded + '">'
          + '<span class="ds-sidebar__group-label">' + item.label + '</span>'
          + '<svg class="ds-sidebar__group-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
          + '</button>'
          + '<ul class="ds-sidebar__sub-nav">' + childrenHtml + '</ul></li>';
      }
      return renderLeafItem(item);
    }

    var html = NAV_DATA.map(function (section) {
      var stateKey = 'section:' + section.heading;
      var expanded = isExpandedDefault(stateKey);
      var items = section.items.map(renderItem).join('');
      var expandedClass = expanded ? ' ds-sidebar__section--expanded' : '';
      return '<div class="ds-sidebar__section' + expandedClass + '" data-state-key="' + stateKey + '">'
        + '<button class="ds-sidebar__heading" aria-expanded="' + expanded + '">'
        + '<span class="ds-sidebar__heading-label">' + section.heading + '</span>'
        + '<svg class="ds-sidebar__chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
        + '</button>'
        + '<ul class="ds-sidebar__nav">' + items + '</ul></div>';
    }).join('');

    sidebar.innerHTML = html;

    var savedScroll = sessionStorage.getItem('ds-sidebar-scroll');
    if (savedScroll !== null) {
      sidebar.scrollTop = parseInt(savedScroll, 10);
    }

    sidebar.querySelectorAll('.ds-sidebar__link').forEach(function (link) {
      link.addEventListener('click', function () {
        sessionStorage.setItem('ds-sidebar-scroll', sidebar.scrollTop);
      });
    });

    function persistToggle(key, expanded) {
      var state = loadState();
      state[key] = expanded;
      saveState(state);
    }

    sidebar.querySelectorAll('.ds-sidebar__heading').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section = this.closest('.ds-sidebar__section');
        var isExpanded = section.classList.contains('ds-sidebar__section--expanded');
        section.classList.toggle('ds-sidebar__section--expanded', !isExpanded);
        this.setAttribute('aria-expanded', String(!isExpanded));
        persistToggle(section.getAttribute('data-state-key'), !isExpanded);
      });
    });

    sidebar.querySelectorAll('.ds-sidebar__group-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = this.closest('.ds-sidebar__group');
        var isExpanded = group.classList.contains('ds-sidebar__group--expanded');
        group.classList.toggle('ds-sidebar__group--expanded', !isExpanded);
        this.setAttribute('aria-expanded', String(!isExpanded));
        persistToggle(group.getAttribute('data-state-key'), !isExpanded);
      });
    });
  }

  /* ---------------------------------------------------------
     Internationalization (i18n)
     --------------------------------------------------------- */
  var UI_STRINGS = {
    pt: {
      'Overview': 'Visão Geral',
      'Foundations': 'Foundations',
      'Components': 'Components',
      'Templates': 'Templates',
      'Guidelines': 'Guidelines',
      'Getting Started': 'Comece por aqui',
      'Token Architecture': 'Token Architecture',
      'Design Principles': 'Design Principles',
      'Changelog': 'Changelog',
      'Colors': 'Colors',
      'Theme Colors': 'Theme Colors',
      'Typography': 'Typography',
      'Icons': 'Icons',
      'Spacing': 'Spacing',
      'Radius': 'Radius',
      'Elevation': 'Elevation',
      'Borders': 'Borders',
      'Motion': 'Motion',
      'Opacity': 'Opacity',
      'Z-index': 'Z-index',
      'Accordion': 'Accordion',
      'Button': 'Button',
      'Input': 'Input',
      'Textarea': 'Textarea',
      'Select': 'Select',
      'Checkbox': 'Checkbox',
      'Radio': 'Radio',
      'Toggle': 'Toggle',
      'Badge': 'Badge',
      'Alert': 'Alert',
      'Card': 'Card',
      'Modal': 'Modal',
      'Menu': 'Menu',
      'Tooltip': 'Tooltip',
      'Tabs': 'Tabs',
      'Breadcrumb': 'Breadcrumb',
      'Avatar': 'Avatar',
      'Divider': 'Divider',
      'Spinner': 'Spinner',
      'Skeleton': 'Skeleton',
      'Form Field': 'Form Field',
      'Login': 'Login',
      'Sign Up': 'Cadastro',
      'Dashboard': 'Dashboard',
      'Settings': 'Configurações',
      'Contact': 'Contato',
      'Theming': 'Theming',
      'Accessibility': 'Accessibility',
      'Control Sizing': 'Control Sizing',
      'Theme': 'Theme',
      'Preview': 'Preview',
      'Code': 'Código',
      'Copy': 'Copiar',
      'Copied!': 'Copiado!',
      'Do': 'Faça',
      "Don't": 'Não faça'
    }
  };

  function getLang() {
    return document.documentElement.getAttribute('lang') || 'pt';
  }

  function translateSharedUI() {
    var lang = getLang();
    var map = UI_STRINGS[lang] || {};
    var hasMap = Object.keys(map).length > 0;

    var els = document.querySelectorAll(
      '.ds-sidebar__heading-label, .ds-sidebar__link, .ds-component-card, ' +
      '.ds-preview__tab, .ds-preview__copy'
    );
    els.forEach(function (el) {
      if (!el.hasAttribute('data-i18n-src')) {
        el.setAttribute('data-i18n-src', el.textContent.trim());
      }
      var src = el.getAttribute('data-i18n-src');
      el.textContent = hasMap ? (map[src] || src) : src;
    });

    // Do/Don't labels (text only, not the class part)
    document.querySelectorAll('.ds-dodont__label').forEach(function (el) {
      if (!el.hasAttribute('data-i18n-src')) {
        el.setAttribute('data-i18n-src', el.textContent.trim());
      }
      var src = el.getAttribute('data-i18n-src');
      el.textContent = hasMap ? (map[src] || src) : src;
    });

    updateModeToggleText();
    translatePageTitle();
  }

  var ICON_MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>';
  var ICON_SUN  = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-5a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 17a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm9-9a1 1 0 0 1 0 2h-1a1 1 0 0 1 0-2h1zM4 12a1 1 0 0 1-1 1H2a1 1 0 0 1 0-2h1a1 1 0 0 1 1 1zm14.95-6.36a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM6.17 17.83a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zm12.02 1.41a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41zM6.17 6.17a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41z"/></svg>';

  function updateModeToggleText() {
    var modeToggle = document.getElementById('mode-toggle');
    if (!modeToggle) return;
    var isDark = document.documentElement.getAttribute('data-mode') === 'dark';
    modeToggle.innerHTML = isDark
      ? ICON_SUN  + ' Light'
      : ICON_MOON + ' Dark';
  }

  function translatePageTitle() {
    if (!document.documentElement.hasAttribute('data-i18n-title')) {
      document.documentElement.setAttribute('data-i18n-title', document.title);
    }
    var original = document.documentElement.getAttribute('data-i18n-title');
    var lang = getLang();
    var map = UI_STRINGS[lang] || {};
    if (Object.keys(map).length) {
      var parts = original.split(' — ');
      if (parts.length === 2) {
        document.title = (map[parts[0]] || parts[0]) + ' — Design System';
      }
    } else {
      document.title = original;
    }
  }

  function initI18n() {
    translateSharedUI();

    var select = document.getElementById('lang-switcher');
    if (!select) return;

    select.value = getLang();

    select.addEventListener('change', function () {
      var newLang = this.value;
      document.documentElement.setAttribute('lang', newLang);
      localStorage.setItem('ds-lang', newLang);
      translateSharedUI();
    });
  }

  /* ---------------------------------------------------------
     Theme Switcher
     --------------------------------------------------------- */
  function initThemeSwitcher() {
    var switcher = document.getElementById('theme-switcher');
    var modeToggle = document.getElementById('mode-toggle');

    /* Theme (palette) */
    if (switcher) {
      var savedTheme = localStorage.getItem('ds-theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        switcher.value = savedTheme;
      }

      switcher.addEventListener('change', function () {
        var theme = this.value;
        if (theme === 'default') {
          document.documentElement.removeAttribute('data-theme');
          localStorage.removeItem('ds-theme');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('ds-theme', theme);
        }
      });
    }

    /* Mode (light / dark) */
    if (modeToggle) {
      var savedMode = localStorage.getItem('ds-mode');
      if (savedMode === 'dark') {
        document.documentElement.setAttribute('data-mode', 'dark');
        modeToggle.setAttribute('aria-pressed', 'true');
      }

      modeToggle.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-mode') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-mode');
          localStorage.removeItem('ds-mode');
          this.setAttribute('aria-pressed', 'false');
        } else {
          document.documentElement.setAttribute('data-mode', 'dark');
          localStorage.setItem('ds-mode', 'dark');
          this.setAttribute('aria-pressed', 'true');
        }
        updateModeToggleText();
      });
    }
  }

  /* ---------------------------------------------------------
     Mobile Sidebar Toggle
     --------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (!toggle || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('ds-sidebar--open');
      if (overlay) overlay.classList.add('ds-sidebar-overlay--visible');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      sidebar.classList.remove('ds-sidebar--open');
      if (overlay) overlay.classList.remove('ds-sidebar-overlay--visible');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = sidebar.classList.contains('ds-sidebar--open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('ds-sidebar--open')) {
        closeSidebar();
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     Copy to Clipboard
     --------------------------------------------------------- */
  function initCopyButtons() {
    document.querySelectorAll('.ds-preview__copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var codeBlock = this.closest('.ds-preview__code').querySelector('code');
        if (!codeBlock) return;

        var text = codeBlock.textContent;
        var currentBtn = btn;
        navigator.clipboard.writeText(text).then(function () {
          currentBtn.textContent = getLang() === 'pt' ? 'Copiado!' : 'Copied!';
          currentBtn.setAttribute('data-i18n-src', getLang() === 'pt' ? 'Copiado!' : 'Copied!');
          setTimeout(function () {
            currentBtn.textContent = getLang() === 'pt' ? 'Copiar' : 'Copy';
            currentBtn.setAttribute('data-i18n-src', getLang() === 'pt' ? 'Copiar' : 'Copy');
          }, 2000);
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Preview Tabs (Preview / Code toggle)
     --------------------------------------------------------- */
  function initPreviewTabs() {
    document.querySelectorAll('.ds-preview').forEach(function (preview) {
      var tabs   = preview.querySelectorAll('.ds-preview__tab');
      var panels = preview.querySelectorAll('.ds-preview__panel'); // Pattern B
      var canvas = preview.querySelector('.ds-preview__canvas');   // Pattern A
      var code   = preview.querySelector('.ds-preview__code');     // Pattern A
      var usesPanels = panels.length > 0;

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = this.getAttribute('data-tab');

          tabs.forEach(function (t) {
            t.classList.remove('ds-preview__tab--active');
            t.setAttribute('aria-selected', 'false');
          });
          this.classList.add('ds-preview__tab--active');
          this.setAttribute('aria-selected', 'true');

          if (usesPanels) {
            // Pattern B: data-panel + ds-preview__panel--active
            panels.forEach(function (p) {
              p.classList.toggle('ds-preview__panel--active', p.getAttribute('data-panel') === target);
            });
          } else {
            // Pattern A: canvas/code siblings with inline display
            if (canvas) canvas.style.display = target === 'preview' ? '' : 'none';
            if (code)   code.style.display   = target === 'code'    ? '' : 'none';
          }
        });

        tab.addEventListener('keydown', function (e) {
          var tabsArray = Array.from(tabs);
          var index = tabsArray.indexOf(this);
          var newIndex;

          if (e.key === 'ArrowRight') {
            newIndex = (index + 1) % tabsArray.length;
          } else if (e.key === 'ArrowLeft') {
            newIndex = (index - 1 + tabsArray.length) % tabsArray.length;
          } else {
            return;
          }

          e.preventDefault();
          tabsArray[newIndex].focus();
          tabsArray[newIndex].click();
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Accordion
     --------------------------------------------------------- */
  function initAccordions() {
    document.querySelectorAll('.ds-accordion').forEach(function (accordion) {
      var triggers = Array.from(accordion.querySelectorAll('.ds-accordion__trigger[aria-controls]')).filter(function (trigger) {
        return trigger.closest('.ds-accordion') === accordion;
      });

      if (!triggers.length) return;

      function setItemState(trigger, expanded) {
        var panelId = trigger.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;
        var item = trigger.closest('.ds-accordion__item');

        trigger.setAttribute('aria-expanded', String(expanded));
        if (panel) panel.hidden = !expanded;
        if (item) item.setAttribute('data-state', expanded ? 'open' : 'closed');
      }

      function moveFocus(current, direction) {
        var currentIndex = triggers.indexOf(current);
        if (currentIndex === -1) return;

        var nextIndex = direction === 'first'
          ? 0
          : direction === 'last'
            ? triggers.length - 1
            : (currentIndex + direction + triggers.length) % triggers.length;

        triggers[nextIndex].focus();
      }

      triggers.forEach(function (trigger) {
        var panel = document.getElementById(trigger.getAttribute('aria-controls'));
        var expanded = trigger.getAttribute('aria-expanded') === 'true' && !(panel && panel.hidden);
        setItemState(trigger, expanded);

        trigger.addEventListener('click', function () {
          if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;

          var shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';
          if (shouldOpen && accordion.getAttribute('data-accordion-mode') === 'single') {
            triggers.forEach(function (otherTrigger) {
              if (otherTrigger !== trigger) setItemState(otherTrigger, false);
            });
          }

          setItemState(trigger, shouldOpen);
        });

        trigger.addEventListener('keydown', function (e) {
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
      });
    });
  }

  /* ---------------------------------------------------------
     Lucide icons
     --------------------------------------------------------- */
  function getRootPrefix() {
    var pathname = window.location.pathname;
    var segments = pathname.split('/').filter(Boolean);
    segments.pop();
    var docsIdx = segments.indexOf('docs');
    if (docsIdx === -1) return '';
    return '../'.repeat(segments.slice(docsIdx).length);
  }

  function initLucideIcons() {
    if (!document.querySelector('[data-lucide]')) return;

    function renderIcons() {
      if (!window.lucide) return;
      window.lucide.createIcons({
        icons: window.lucide.icons,
        attrs: { 'aria-hidden': 'true' }
      });
    }

    if (window.lucide) {
      renderIcons();
      return;
    }

    var script = document.createElement('script');
    script.src = getRootPrefix() + 'docs/assets/vendor/lucide.min.js';
    script.onload = renderIcons;
    document.head.appendChild(script);
  }

  /* ---------------------------------------------------------
     Textarea Character Counter
     --------------------------------------------------------- */
  function initCharCounters() {
    document.querySelectorAll('[data-maxlength]').forEach(function (textarea) {
      var max = parseInt(textarea.getAttribute('data-maxlength'), 10);
      var counter = document.getElementById(textarea.getAttribute('data-counter'));
      if (!counter) return;

      function update() {
        var remaining = max - textarea.value.length;
        counter.textContent = textarea.value.length + ' / ' + max;
        if (remaining < 0) {
          counter.classList.add('ds-field__counter--over');
        } else {
          counter.classList.remove('ds-field__counter--over');
        }
      }

      textarea.addEventListener('input', update);
      update();
    });
  }

  function initFocusableCodeBlocks() {
    document.querySelectorAll('.ds-code-block').forEach(function (block) {
      if (!block.hasAttribute('tabindex')) block.setAttribute('tabindex', '0');
    });
  }

  /* ---------------------------------------------------------
     Initialize All
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildSidebar();
    initThemeSwitcher();
    initI18n();
    initMobileNav();
    initCopyButtons();
    initPreviewTabs();
    initAccordions();
    initCharCounters();
    initFocusableCodeBlocks();
    initLucideIcons();
  });
})();
