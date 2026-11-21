/* Zubair Mustafa — Portfolio interactions (vanilla JS) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---------- Theme (persisted) ---------- */
  var STORAGE_KEY = 'zm-theme';
  function storedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveTheme(t) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) { /* storage unavailable */ }
  }
  var initial = storedTheme() ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  ready(function () {
    /* ---------- Theme toggle ---------- */
    var themeBtn = document.getElementById('theme-toggle');
    function syncThemeBtn() {
      var dark = root.getAttribute('data-theme') === 'dark';
      themeBtn.setAttribute('aria-pressed', String(dark));
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    syncThemeBtn();
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      saveTheme(next);
      syncThemeBtn();
    });

    /* ---------- Mobile navigation ---------- */
    var menuBtn = document.getElementById('menu-toggle');
    var nav = document.getElementById('primary-nav');
    function setMenu(open) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 960) setMenu(false);
    });

    /* ---------- Smooth scrolling (respects reduced motion) ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', id);
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });

    /* ---------- Active nav link on scroll ---------- */
    var links = Array.prototype.slice.call(document.querySelectorAll('.primary-nav li a'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) {
            var on = a.getAttribute('href') === '#' + entry.target.id;
            a.classList.toggle('active', on);
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(function (s) { if (s) spy.observe(s); });
    }

    /* ---------- Section colour transitions and active navigation accent ---------- */
    var toneSections = Array.prototype.slice.call(document.querySelectorAll('main > section[id]'));
    if ('IntersectionObserver' in window) {
      var toneObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            document.body.setAttribute('data-active-section', entry.target.id);
            toneSections.forEach(function (section) {
              section.classList.toggle('is-current', section === entry.target);
            });
          }
        });
      }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
      toneSections.forEach(function (section) { toneObserver.observe(section); });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Typing animation ---------- */
    var typingEl = document.getElementById('typing');
    var words = [
      'Artificial Intelligence',
      'Climate & Environmental Research',
      'Data Science',
      'Software Engineering',
      'Blockchain Technology',
      'Technology for Social Impact'
    ];
    if (typingEl && !reduceMotion) {
      var w = 0, c = 0, deleting = false;
      (function tick() {
        var word = words[w];
        typingEl.textContent = word.slice(0, c);
        var delay = deleting ? 35 : 70;
        if (!deleting && c === word.length) { deleting = true; delay = 1600; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
        c += deleting ? -1 : 1;
        if (c < 0) c = 0;
        setTimeout(tick, delay);
      })();
    } else if (typingEl) {
      typingEl.textContent = words.join(' · ');
      var caret = document.querySelector('.caret');
      if (caret) caret.hidden = true;
    }

    /* ---------- Project filtering ---------- */
    var filterBtns = document.querySelectorAll('.filter');
    var cards = document.querySelectorAll('#project-grid .project');
    var emptyMsg = document.getElementById('filter-empty');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        var shown = 0;
        cards.forEach(function (card) {
          var cats = (card.getAttribute('data-category') || '').split(' ');
          var match = f === 'all' || cats.indexOf(f) !== -1;
          card.hidden = !match;
          if (match) shown++;
        });
        emptyMsg.hidden = shown !== 0;
      });
    });

    /* ---------- Missing-image placeholders ---------- */
    document.querySelectorAll('[data-placeholder] img').forEach(function (img) {
      function flag() { img.closest('[data-placeholder]').classList.add('img-missing'); }
      if (img.complete && img.naturalWidth === 0) flag();
      img.addEventListener('error', flag);
    });

    /* ---------- Image preview lightbox ---------- */
    var box = document.getElementById('lightbox');
    var boxImg = document.getElementById('lightbox-img');
    var boxCap = document.getElementById('lightbox-caption');
    var lastTrigger = null;
    document.querySelectorAll('[data-lightbox]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var inner = btn.querySelector('img');
        if (inner && btn.closest('.img-missing')) return; // nothing to preview yet
        lastTrigger = btn;
        boxImg.src = btn.getAttribute('data-lightbox');
        boxImg.alt = inner ? inner.alt : '';
        boxCap.textContent = btn.getAttribute('data-caption') || '';
        if (typeof box.showModal === 'function') box.showModal();
        else window.open(boxImg.src, '_blank', 'noopener');
      });
    });
    function showImage(src, alt, caption, trigger) {
      if (!src) return;
      lastTrigger = trigger || null;
      boxImg.src = src;
      boxImg.alt = alt || '';
      boxCap.textContent = caption || alt || '';
      if (typeof box.showModal === 'function') box.showModal();
      else window.open(src, '_blank', 'noopener');
    }

    // Existing explicit preview controls (for example, the research acceptance notice).
    document.querySelectorAll('[data-lightbox]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var inner = btn.querySelector('img');
        if (inner && btn.closest('.img-missing')) return;
        showImage(btn.getAttribute('data-lightbox'), inner ? inner.alt : '',
          btn.getAttribute('data-caption') || '', btn);
      });
    });

    // Make portfolio photographs, project screenshots, and certificates enlargeable.
    // Keep the main profile photograph and institutional / community logos static.
    document.querySelectorAll('img').forEach(function (img) {
      if (img.id === 'lightbox-img' || img.closest('[data-lightbox]')) return;
      if (img.closest('.hero-photo, .edu-heading, .activity-logo')) return;
      if (img.getAttribute('src') && img.getAttribute('src').indexOf('/logos/') !== -1) return;
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.setAttribute('data-image-zoom', 'true');
      img.setAttribute('aria-label', 'Enlarge image: ' + (img.alt || 'portfolio image'));
      function openThisImage() {
        if (!img.naturalWidth || img.closest('.img-missing')) return;
        var figure = img.closest('figure');
        var caption = figure && figure.querySelector('figcaption');
        showImage(img.currentSrc || img.src, img.alt,
          caption ? caption.textContent.trim() : img.alt, img);
      }
      img.addEventListener('click', openThisImage);
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openThisImage();
        }
      });
    });

    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
    box.addEventListener('close', function () { if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus(); });

    /* ---------- Contact form validation ---------- */
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your name.'; },
      email: function (v) { return emailRe.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      subject: function (v) { return v.trim().length >= 3 ? '' : 'Please enter a subject.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Please write at least 10 characters.'; }
    };
    function check(field) {
      var input = form.elements[field];
      var msg = rules[field](input.value);
      var wrap = input.closest('.field');
      wrap.classList.toggle('invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      document.getElementById('cf-' + field + '-err').textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (f) {
      form.elements[f].addEventListener('blur', function () { check(f); });
      form.elements[f].addEventListener('input', function () {
        if (form.elements[f].closest('.field').classList.contains('invalid')) check(f);
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      var firstBad = null;
      Object.keys(rules).forEach(function (f) {
        if (!check(f) && !firstBad) firstBad = form.elements[f];
      });
      if (firstBad) { firstBad.focus(); return; }
      var to = document.querySelector('.contact-list a[href^="mailto:"]').getAttribute('href').replace('mailto:', '');
      var body = 'Name: ' + form.elements.name.value.trim() + '\n' +
        'Email: ' + form.elements.email.value.trim() + '\n\n' +
        form.elements.message.value.trim();
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(form.elements.subject.value.trim()) +
        '&body=' + encodeURIComponent(body);
      status.textContent = 'Details look good. Your email app should open with the message ready to send.';
    });

    /* ---------- Contextual Gantabya accent ---------- */
    var gantabyaCard = document.getElementById('gantabya-project');
    if (gantabyaCard && 'IntersectionObserver' in window) {
      var gantabyaObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          document.body.toggleAttribute('data-project-context', entry.isIntersecting);
          if (entry.isIntersecting) document.body.setAttribute('data-project-context', 'gantabya');
        });
      }, { threshold: 0.35 });
      gantabyaObserver.observe(gantabyaCard);
    }

    /* ---------- Back to top ---------- */
    var toTop = document.getElementById('to-top');
    function toggleTop() { toTop.hidden = window.scrollY < 600; }
    window.addEventListener('scroll', toggleTop, { passive: true });
    toggleTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      document.getElementById('top').focus({ preventScroll: true });
    });

    /* ---------- Footer year ---------- */
    var yr = document.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
