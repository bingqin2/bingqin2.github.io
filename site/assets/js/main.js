(function () {
  'use strict';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme: light <-> dark, starting from the system preference ---------- */
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var toggle = document.getElementById('theme-toggle');
  function storedTheme() {
    var s = null;
    try { s = localStorage.getItem('theme'); } catch (e) {}
    return (s === 'light' || s === 'dark') ? s : null;
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#171d2e' : '#f6f7fb');
    if (toggle) {
      var label = 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' theme';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }
  }
  function switchTheme() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    var run = function () {
      setTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    };
    if (reduceMotion) { run(); return; }
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(run);
    } else {
      root.classList.add('theme-transition');
      run();
      setTimeout(function () { root.classList.remove('theme-transition'); }, 600);
    }
  }
  if (toggle) toggle.addEventListener('click', switchTheme);
  if (mq.addEventListener) {
    mq.addEventListener('change', function () {
      if (!storedTheme()) setTheme(mq.matches ? 'dark' : 'light');
    });
  }
  setTheme(storedTheme() || (mq.matches ? 'dark' : 'light'));

  /* ---------- Persona: which introduction to show ---------- */
  var bio = document.getElementById('bio');
  var select = document.getElementById('model-select');
  var variant = document.getElementById('model-variant');
  var options = select ? Array.prototype.slice.call(select.querySelectorAll('[data-persona]')) : [];

  function renderBio(name) {
    var tpl = document.getElementById('bio-' + name);
    if (!tpl || !bio) return;
    bio.innerHTML = '';
    bio.appendChild(tpl.content.cloneNode(true));
    var caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    bio.appendChild(caret);
    bio.setAttribute('data-persona', name);
  }
  function setPersona(name, animate) {
    if (!document.getElementById('bio-' + name)) name = 'engineer';
    options.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.persona === name)); });
    if (variant) variant.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    try { localStorage.setItem('persona', name); } catch (e) {}
    if (animate && !reduceMotion) {
      bio.classList.add('is-changing');
      setTimeout(function () { renderBio(name); bio.classList.remove('is-changing'); }, 180);
    } else {
      renderBio(name);
    }
  }
  options.forEach(function (b) {
    b.addEventListener('click', function () {
      setPersona(b.dataset.persona, true);
      select.removeAttribute('open');
    });
  });
  document.addEventListener('click', function (e) {
    if (select && select.hasAttribute('open') && !select.contains(e.target)) select.removeAttribute('open');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && select && select.hasAttribute('open')) select.removeAttribute('open');
  });
  var savedPersona = 'engineer';
  try { savedPersona = localStorage.getItem('persona') || 'engineer'; } catch (e) {}
  setPersona(savedPersona, false);

  /* ---------- Quick links open inline panels ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.quick-link[data-panel]'));
  var wraps = {};
  links.forEach(function (b) { wraps[b.dataset.panel] = document.getElementById('panel-' + b.dataset.panel); });

  function openPanel(name) {
    links.forEach(function (b) {
      var on = b.dataset.panel === name;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-expanded', String(on));
    });
    Object.keys(wraps).forEach(function (k) {
      var w = wraps[k];
      if (!w) return;
      var on = k === name;
      w.classList.toggle('open', on);
      var inner = w.querySelector('.panel-inner');
      if (inner) { if (on) inner.removeAttribute('inert'); else inner.setAttribute('inert', ''); }
    });
    var hash = name ? '#' + name : ' ';
    if (history.replaceState) history.replaceState(null, '', name ? hash : location.pathname + location.search);
  }
  links.forEach(function (b) {
    b.addEventListener('click', function () {
      var name = b.dataset.panel;
      var isOpen = b.classList.contains('is-active');
      openPanel(isOpen ? null : name);
      if (!isOpen && wraps[name]) {
        setTimeout(function () {
          var top = wraps[name].getBoundingClientRect().top + window.pageYOffset - 84;
          if (top > window.pageYOffset) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }, 120);
      }
    });
  });
  var initial = (location.hash || '').replace('#', '');
  if (initial && wraps[initial]) openPanel(initial);

  /* ---------- Greeting bubble on the avatar ---------- */
  var identity = document.querySelector('.identity');
  var mascot = document.getElementById('mascot');
  var helloText = document.getElementById('hello-text');
  var greetings = ['Hi there', '你好', 'Hello from Champaign', 'Nice to meet you', 'Thanks for stopping by'];
  var gi = 0, timer = null;

  function showGreeting() {
    if (!helloText) return;
    helloText.textContent = greetings[gi % greetings.length];
  }
  function speak() {
    if (!identity) return;
    identity.classList.add('is-speaking');
    showGreeting();
    if (timer) return;
    timer = setInterval(function () {
      gi++;
      helloText.classList.add('is-changing');
      setTimeout(function () { showGreeting(); helloText.classList.remove('is-changing'); }, 180);
    }, 1700);
  }
  function hush() {
    if (!identity) return;
    identity.classList.remove('is-speaking');
    if (timer) { clearInterval(timer); timer = null; }
    gi++;
  }
  if (mascot) {
    mascot.addEventListener('mouseenter', speak);
    mascot.addEventListener('mouseleave', hush);
    mascot.addEventListener('focus', speak);
    mascot.addEventListener('blur', hush);
    mascot.addEventListener('click', function (e) {
      e.stopPropagation();
      if (identity.classList.contains('is-speaking') && !timer) hush(); else speak();
    });
    document.addEventListener('click', function (e) {
      if (!mascot.contains(e.target)) hush();
    });
  }
  var navAvatar = document.getElementById('navbar-avatar');
  if (navAvatar) {
    navAvatar.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      openPanel(null);
      setTimeout(speak, 300);
      setTimeout(hush, 2600);
    });
  }

  /* ---------- Click sparkles ---------- */
  if (!reduceMotion && 'animate' in Element.prototype) {
    var chars = ['✦', '✧', '★', '✩', '·'];
    var colors = ['#66c2ff', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#ffffff'];
    document.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var n = 6 + Math.floor(Math.random() * 5);
      for (var i = 0; i < n; i++) {
        var s = document.createElement('span');
        s.className = 'niji-star';
        s.textContent = chars[Math.floor(Math.random() * chars.length)];
        s.style.color = colors[Math.floor(Math.random() * colors.length)];
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.fontSize = (10 + Math.random() * 10) + 'px';
        document.body.appendChild(s);
        var a = Math.random() * Math.PI * 2;
        var d = 22 + Math.random() * 36;
        var dx = Math.cos(a) * d;
        var dy = Math.sin(a) * d - 12;
        (function (el) {
          var anim = el.animate([
            { opacity: 1, transform: 'translate(-50%, -50%) scale(0.4) rotate(0deg)' },
            { opacity: 0, transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1.1) rotate(90deg)' }
          ], { duration: 650, easing: 'ease-out', fill: 'forwards' });
          anim.onfinish = function () { el.remove(); };
          setTimeout(function () { if (el.parentNode) el.remove(); }, 1500);
        })(s);
      }
    });
  }
})();
