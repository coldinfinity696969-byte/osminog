/* OSMINOG landing — interactions */
(function () {
  'use strict';

  // ---- sticky header ----
  var header = document.querySelector('.header');
  var onScroll = function () {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- mobile menu ----
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  }

  // ---- smooth inertial scroll (desktop, pointer-fine, motion allowed) ----
  var canSmooth = window.matchMedia('(pointer:fine)').matches &&
                  window.innerWidth >= 1024 &&
                  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canSmooth) {
    var docEl = document.documentElement;
    docEl.style.scrollBehavior = 'auto'; // мы управляем скроллом сами
    var sTarget = window.scrollY, sCurrent = window.scrollY, sAnimating = false;
    var EASE = 0.09;
    var maxScroll = function () { return Math.max(0, docEl.scrollHeight - window.innerHeight); };
    var sClamp = function (v) { return Math.max(0, Math.min(v, maxScroll())); };
    var sLoop = function () {
      var diff = sTarget - sCurrent;
      if (Math.abs(diff) < 0.4) { sCurrent = sTarget; window.scrollTo(0, Math.round(sCurrent)); sAnimating = false; return; }
      sCurrent += diff * EASE;
      window.scrollTo(0, Math.round(sCurrent));
      requestAnimationFrame(sLoop);
    };
    var sStart = function () { if (!sAnimating) { sAnimating = true; requestAnimationFrame(sLoop); } };
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.deltaY === 0) return; // не мешаем zoom / горизонтали
      e.preventDefault();
      var unit = e.deltaMode === 1 ? 24 : (e.deltaMode === 2 ? window.innerHeight : 1);
      sTarget = sClamp((sAnimating ? sTarget : window.scrollY) + e.deltaY * unit);
      sStart();
    }, { passive: false });
    window.addEventListener('scroll', function () { if (!sAnimating) { sCurrent = sTarget = window.scrollY; } }, { passive: true });
    window.addEventListener('resize', function () { sTarget = sClamp(sTarget); });
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        sTarget = sClamp(window.scrollY + el.getBoundingClientRect().top - 72);
        sStart();
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }

  // ---- reveal on scroll ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var ans = item.querySelector('.faq-a');
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });

  // ---- video testimonial ----
  var phone = document.querySelector('.phone');
  if (phone) {
    var vid = phone.querySelector('video');
    var play = phone.querySelector('.play');
    play.addEventListener('click', function () {
      phone.classList.add('playing');
      vid.play();
      vid.setAttribute('controls', 'controls');
    });
    vid.addEventListener('pause', function () {
      if (vid.currentTime > 0 && !vid.ended) return;
    });
  }

  // ---- contact form (no backend → mailto + graceful success) ----
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.name.value || '').trim();
      var phonev = (form.phone.value || '').trim();
      var msg = (form.message.value || '').trim();
      var niche = form.getAttribute('data-niche') || 'сайт';
      var subject = 'Заявка с лендинга OSMINOG (' + niche + ')';
      var body =
        'Имя: ' + name + '\n' +
        'Телефон: ' + phonev + '\n' +
        'Задача: ' + (msg || '—') + '\n\n' +
        'Отправлено с посадочной: ' + location.href;
      // open mail client with prefilled data
      window.location.href = 'mailto:info@osminog.biz?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      // show success state
      form.querySelector('.form-fields').style.display = 'none';
      form.querySelector('.form-ok').classList.add('show');
    });
  }

  // ---- hero background video (desktop only, respects reduced motion) ----
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth >= 768 && !reduce) {
      heroVideo.setAttribute('preload', 'auto');
      var startHero = function () {
        var p = heroVideo.play();
        if (p && p.then) p.then(function () { heroVideo.classList.add('ready'); }).catch(function () {});
        else heroVideo.classList.add('ready');
      };
      heroVideo.addEventListener('loadeddata', function () { heroVideo.classList.add('ready'); startHero(); });
      heroVideo.load();
      if (heroVideo.readyState >= 2) startHero();
    }
  }

  // ---- scroll progress bar ----
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var barTicking = false;
  var updateBar = function () {
    var st = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    barTicking = false;
  };
  window.addEventListener('scroll', function () {
    if (!barTicking) { barTicking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  // ---- count-up numbers (12+, 100+, 500+, 3000+ ...) ----
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animateCount = function (el) {
    var m = /^(\d[\d\s]*)(.*)$/.exec(el.textContent.trim());
    if (!m) return;
    var target = parseInt(m[1].replace(/\s/g, ''), 10);
    var suffix = m[2] || '';
    if (isNaN(target) || target < 10) return;
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var dur = 1400, start = 0, t0 = null;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  var numEls = document.querySelectorAll('.stat .num, .exp .num');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); nio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    numEls.forEach(function (el) { nio.observe(el); });
  }

  // ---- cursor spotlight on cards ----
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.pcard, .bcard');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // ---- year ----
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
