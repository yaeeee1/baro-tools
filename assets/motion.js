/* 스크롤 등장 애니메이션 + 상단바 스크롤 그림자.
   기존 페이지 스크립트는 전혀 건드리지 않고, 이 파일만 별도로 실행된다.
   접근성 설정(prefers-reduced-motion)을 존중해 아예 관찰하지 않는다. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;

    var selectors = [
      '.hero', '.grid>.card', '.cards>.card', '.guide-card', '.bento>.t-card',
      '.why-item', '.help-card', '.help-intro', '.trust-box', '.article>section'
    ];
    var nodes = document.querySelectorAll(selectors.join(','));
    if (!nodes.length) return;

    var counters = new Map();
    nodes.forEach(function (el) {
      var i = counters.get(el.parentElement) || 0;
      counters.set(el.parentElement, i + 1);
      el.style.setProperty('--i', Math.min(i, 8));
      el.setAttribute('data-reveal', '');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    nodes.forEach(function (el) { io.observe(el); });
  }

  /* 카드에 마우스를 올리면 커서 위치를 따라 은은한 하이라이트가 움직인다.
     스크롤 이벤트가 아닌 개별 요소의 pointermove만 사용하므로 스로틀이 필요 없다. */
  function initCardGlow() {
    if (reduce) return;
    var cards = document.querySelectorAll('.t-card:not(.soon)');
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* 목차(.toc)가 있는 가이드/운영안내 페이지에서 현재 읽고 있는 섹션을 강조한다.
     스크롤 이벤트 대신 IntersectionObserver로 섹션 진입만 관찰한다. */
  function initTocSpy() {
    if (!('IntersectionObserver' in window)) return;
    var toc = document.querySelector('.toc');
    if (!toc) return;
    var links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

    ids.forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  function initScrollShadow() {
    var top = document.querySelector('.top');
    if (!top) return;
    var ticking = false;
    function update() {
      top.classList.toggle('is-scrolled', window.scrollY > 4);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  function run() {
    initReveal();
    initCardGlow();
    initTocSpy();
    initScrollShadow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
