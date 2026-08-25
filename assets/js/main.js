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

  // ---- year ----
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
