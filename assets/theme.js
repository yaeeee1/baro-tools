/* 라이트/다크 모드 전환
   화면이 깜빡이지 않도록 테마 적용 자체는 각 페이지 <head> 의 짧은 코드가 먼저 처리한다.
   이 파일은 버튼을 만들어 붙이고 전환을 처리한다. */
(function () {
  var KEY = 'baro-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  /* 주소창·상태바 색도 함께 맞춘다 */
  function syncMeta(mode) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) {
      m = document.createElement('meta');
      m.name = 'theme-color';
      document.head.appendChild(m);
    }
    m.content = mode === 'dark' ? '#14151a' : '#141519';
  }

  function label(btn, mode) {
    var next = mode === 'dark' ? '라이트' : '다크';
    btn.setAttribute('aria-label', next + ' 모드로 바꾸기');
    btn.setAttribute('title', next + ' 모드로 바꾸기');
    btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
  }

  function apply(mode, btn) {
    root.setAttribute('data-theme', mode);
    syncMeta(mode);
    if (btn) label(btn, mode);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }

  function build() {
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    btn.innerHTML =
      '<svg class="ti sun" viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4.2"/>' +
        '<g stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2' +
        'M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg>' +
      '<svg class="ti moon" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z"/></svg>';

    label(btn, current());
    syncMeta(current());

    btn.addEventListener('click', function () {
      apply(current() === 'dark' ? 'light' : 'dark', btn);
    });

    /* 사용자가 직접 고르지 않았다면 기기 설정 변화를 따라간다 */
    try {
      var saved = localStorage.getItem(KEY);
      if (!saved && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
          if (localStorage.getItem(KEY)) return;
          root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
          syncMeta(current());
          label(btn, current());
        });
      }
    } catch (e) {}
  }


  /* 인쇄는 흰 종이 기준이므로 인쇄 중에만 라이트로 바꾼다 */
  var beforePrint = null;
  window.addEventListener('beforeprint', function () {
    beforePrint = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'light');
  });
  window.addEventListener('afterprint', function () {
    if (beforePrint) root.setAttribute('data-theme', beforePrint);
    beforePrint = null;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
