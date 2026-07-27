/**
 * Neusa Vidal — interações da página.
 * Sem dependências. Cada bloco é independente: se um elemento não existir,
 * o restante continua funcionando.
 */
(function () {
  'use strict';

  // Cancela a rede de segurança declarada no <head> (ver index.html)
  window.__nvReady = true;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Ano do rodapé ------------------------------------------------------- */
  var anoEl = document.querySelector('[data-ano]');
  if (anoEl) {
    anoEl.textContent = String(new Date().getFullYear());
  }

  /* Menu mobile --------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-principal');

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-nav-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Fecha ao escolher um destino
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    // Voltando ao desktop, o painel precisa sair do estado "aberto"
    var wide = window.matchMedia('(min-width: 62.0625em)');
    var onWide = function (e) { if (e.matches) setNav(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else wide.addListener(onWide);
  }

  /* Sombra do cabeçalho ao rolar + botão flutuante do WhatsApp ---------- */
  var header = document.querySelector('.header');
  var fab = document.getElementById('whatsapp-fab');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 12);
    if (fab) fab.classList.toggle('is-visible', y > 420);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* Link ativo conforme a seção visível --------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = new Map();

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      // Vence a seção com maior área visível; nenhuma visível => nenhum link ativo
      var bestId = null;
      var bestRatio = 0;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });

      navLinks.forEach(function (link) {
        var isActive = bestId !== null && link.getAttribute('href') === '#' + bestId;
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, {
      // Desconta o cabeçalho fixo no topo da área de interesse
      rootMargin: '-25% 0px -45% 0px',
      threshold: [0, 0.15, 0.35, 0.6, 1]
    });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* Entrada dos elementos ao rolar -------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Formulário de contato ----------------------------------------------- */
  var form = document.getElementById('form-contato');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submitBtn = form.querySelector('[data-submit]');
  var submitLabel = form.querySelector('[data-submit-label]');
  var originalLabel = submitLabel ? submitLabel.textContent : 'Enviar';

  function fieldWrapper(input) {
    return input.closest('.field');
  }

  function showFieldError(input, invalid) {
    var wrapper = fieldWrapper(input);
    if (wrapper) wrapper.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function setStatus(state, message) {
    if (!status) return;
    status.dataset.state = state;
    status.textContent = message;
    status.classList.add('is-visible');
  }

  function clearStatus() {
    if (!status) return;
    status.classList.remove('is-visible');
    status.textContent = '';
    delete status.dataset.state;
  }

  // Valida ao sair do campo, mas só remove o erro enquanto digita
  form.querySelectorAll('.input').forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.value.trim() !== '' || input.required) {
        showFieldError(input, !input.checkValidity());
      }
    });

    input.addEventListener('input', function () {
      if (input.checkValidity()) showFieldError(input, false);
    });
  });

  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.setAttribute('aria-busy', String(busy));
    submitBtn.disabled = busy;
    if (!submitLabel) return;
    submitLabel.textContent = busy ? 'Enviando…' : originalLabel;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearStatus();

    var inputs = Array.prototype.slice.call(form.querySelectorAll('.input'));
    var invalid = inputs.filter(function (input) { return !input.checkValidity(); });

    inputs.forEach(function (input) { showFieldError(input, !input.checkValidity()); });

    if (invalid.length) {
      setStatus('error', 'Revise os campos destacados antes de enviar.');
      invalid[0].focus();
      return;
    }

    setBusy(true);

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        inputs.forEach(function (input) { showFieldError(input, false); });
        setStatus('success', 'Mensagem enviada. O retorno chega no e-mail informado, em dias úteis.');
      })
      .catch(function () {
        setStatus(
          'error',
          'Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp (11) 97273-6489.'
        );
      })
      .then(function () {
        setBusy(false);
      });
  });
})();
