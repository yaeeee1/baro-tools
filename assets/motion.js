/* 스크롤 등장 애니메이션 + 상단바 스크롤 그림자.
   기존 페이지 스크립트는 전혀 건드리지 않고, 이 파일만 별도로 실행된다.
   접근성 설정(prefers-reduced-motion)을 존중해 아예 관찰하지 않는다. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;

    var selectors = [
      '.hero', '.grid>.card', '.cards>.card', '.guide-card',
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
    initScrollShadow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
