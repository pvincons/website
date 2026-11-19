/*!
 * PV INCONS – Home loader
 * ------------------------------------------------------------------
 * Nạp mục "Công ty thành viên / Công ty liên kết / Đối tác chuỗi cung ứng"
 * cho trang chủ (index.html) từ bảng posts_partners trong database/website.db.
 *
 * Yêu cầu: nạp assets/js/pv-sqlite.js TRƯỚC file này.
 *
 * Cấu trúc dữ liệu (posts_partners):
 *     category      thanh-vien | lien-ket | chuoi-cung-ung
 *     categoryLabel nhãn tab (không bắt buộc – có giá trị mặc định)
 *     title         tên công ty / đối tác (dùng làm alt + chữ thay thế khi logo lỗi)
 *     image         URL / đường dẫn ảnh logo
 *     link          website của đối tác (không bắt buộc)
 *
 * Khung HTML cần có trong index.html: <section id="partners-section" hidden> ... </section>
 * (xem phần "ĐỐI TÁC" trong index.html). Mục sẽ tự ẩn nếu chưa có dữ liệu.
 *
 * API: window.initHomePartners()  – chạy lại khi trang được nạp kiểu AJAX.
 */
(function (global) {
  'use strict';

  var TABS = [
    { key: 'thanh-vien', label: 'Công ty thành viên' },
    { key: 'lien-ket', label: 'Công ty liên kết' },
    { key: 'chuoi-cung-ung', label: 'Đối tác chuỗi cung ứng' }
  ];

  var ACCENT = '#8c6239';
  var GRAND_BLUE = 'rgb(20,97,148)';
  var STYLE_ID = 'pv-partners-style';

  var CSS = [
    '.pv-partners{display:block;background:#f6f4f1;border-top:1px solid #ece7df;padding:48px 0 56px}',
    '.pv-partners[hidden]{display:none}',
    '.pv-partners__inner{max-width:80rem;margin:0 auto;padding:0 1rem}',
    '@media(min-width:640px){.pv-partners__inner{padding:0 1.5rem}}',
    '@media(min-width:1024px){.pv-partners{padding:64px 0 72px}.pv-partners__inner{padding:0 2rem}}',

    '.pv-partners__title{display:flex;align-items:center;gap:12px;margin:0 0 24px;color:' + GRAND_BLUE + ';',
    'font-weight:800;font-size:clamp(1.5rem,4.2vw,2.5rem);line-height:1.15;letter-spacing:.02em;text-transform:uppercase}',
    '.pv-partners__title::before{content:"";flex:none;width:5px;height:1em;background:' + GRAND_BLUE + ';border-radius:2px}',

    '.pv-partners__tabs{display:flex;gap:28px;border-bottom:1px solid #e4ded4;overflow-x:auto;scrollbar-width:none}',
    '.pv-partners__tabs::-webkit-scrollbar{display:none}',
    '.pv-partners__tab{flex:none;margin:0 0 -1px;padding:0 0 14px;background:none;border:0;border-bottom:2px solid transparent;',
    'color:#334155;font-family:inherit;font-weight:600;font-size:.95rem;line-height:1.2;white-space:nowrap;cursor:pointer;transition:color .2s,border-color .2s}',
    '.pv-partners__tab:hover{color:' + ACCENT + '}',
    '.pv-partners__tab.is-active{color:' + ACCENT + ';border-bottom-color:' + ACCENT + '}',
    '.pv-partners__tab:focus-visible,.pv-partners__nav:focus-visible{outline:2px solid ' + ACCENT + ';outline-offset:3px}',
    '@media(min-width:640px){.pv-partners__tab{font-size:1rem}.pv-partners__tabs{gap:40px}}',

    '.pv-partners__carousel{display:flex;align-items:center;gap:12px;margin-top:32px}',
    '@media(min-width:1024px){.pv-partners__carousel{gap:24px;margin-top:44px}}',
    '.pv-partners__viewport{flex:1;min-width:0;overflow:hidden;touch-action:pan-y}',
    '.pv-partners__track{display:flex;transition:transform .5s ease;will-change:transform}',
    '.pv-partners__track.is-static{justify-content:center}',

    '.pv-partner{flex:0 0 calc(100% / var(--pv-per-view,5));box-sizing:border-box;display:flex;align-items:center;justify-content:center;',
    'height:88px;padding:0 10px;text-decoration:none;color:inherit}',
    '@media(min-width:1024px){.pv-partner{height:104px;padding:0 16px}}',
    '.pv-partner img{display:block;max-width:100%;max-height:60px;width:auto;height:auto;object-fit:contain;transition:transform .3s ease}',
    '@media(min-width:1024px){.pv-partner img{max-height:72px}}',
    'a.pv-partner:hover img{transform:scale(1.06)}',
    '.pv-partner__name{display:block;text-align:center;color:#475569;font-weight:700;font-size:.8rem;line-height:1.3;letter-spacing:.03em;text-transform:uppercase}',

    '.pv-partners__nav{flex:none;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;padding:0;',
    'background:transparent;color:' + ACCENT + ';border:1px solid ' + ACCENT + ';cursor:pointer;transition:background .2s,color .2s,opacity .2s}',
    '@media(min-width:1024px){.pv-partners__nav{width:48px;height:48px}}',
    '.pv-partners__nav:hover{background:' + ACCENT + ';color:#fff}',
    '.pv-partners__nav[disabled]{opacity:.3;cursor:default;pointer-events:none}',
    '.pv-partners__nav.is-hidden{visibility:hidden}',

    '@media(prefers-reduced-motion:reduce){.pv-partners__track,.pv-partner img{transition:none}}'
  ].join('');

  var state = { groups: {}, tabs: [], active: null, index: 0, resizeBound: false, resizeTimer: null };

  // ---------------------------------------------------------------
  // Tiện ích
  // ---------------------------------------------------------------
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // Chỉ cho phép http(s), đường dẫn tương đối, data:image – chặn javascript: và các scheme lạ
  function safeUrl(u, allowMail) {
    u = String(u == null ? '' : u).trim();
    if (!u) return '';
    if (/^(https?:)?\/\//i.test(u)) return u;
    if (/^data:image\//i.test(u)) return u;
    if (allowMail && /^(mailto|tel):/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';
    return u;
  }

  function perView() {
    var w = global.innerWidth || document.documentElement.clientWidth || 1024;
    if (w >= 1024) return 5;
    if (w >= 640) return 3;
    return 2;
  }

  function $(root, sel) { return root.querySelector(sel); }

  // ---------------------------------------------------------------
  // Hiển thị
  // ---------------------------------------------------------------
  function renderTabs(root) {
    var box = $(root, '[data-partners-tabs]');
    if (!box) return;
    box.innerHTML = '';
    state.tabs.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pv-partners__tab' + (t.key === state.active ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', t.key === state.active ? 'true' : 'false');
      b.textContent = t.label;
      b.addEventListener('click', function () { selectTab(t.key); });
      box.appendChild(b);
    });
  }

  function buildItem(it) {
    var url = safeUrl(it.link, false);
    var el = document.createElement(url ? 'a' : 'div');
    el.className = 'pv-partner';
    var name = String(it.title || '').trim();

    if (url) {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
    if (name) el.title = name;

    function showName() {
      var s = document.createElement('span');
      s.className = 'pv-partner__name';
      s.textContent = name || 'Đối tác';
      return s;
    }

    var src = safeUrl(it.image, false);
    if (src) {
      var img = document.createElement('img');
      img.alt = name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', function () {
        if (img.parentNode) img.parentNode.replaceChild(showName(), img);   // logo lỗi -> hiện tên công ty
      });
      img.src = src;
      el.appendChild(img);
    } else {
      el.appendChild(showName());
    }
    return el;
  }

  function renderTrack(root) {
    var track = $(root, '[data-partners-track]');
    if (!track) return;
    track.innerHTML = '';
    (state.groups[state.active] || []).forEach(function (it) {
      track.appendChild(buildItem(it));
    });
    state.index = 0;
    updateCarousel(root);
  }

  function updateCarousel(root) {
    var track = $(root, '[data-partners-track]');
    var prev = $(root, '[data-partners-prev]');
    var next = $(root, '[data-partners-next]');
    if (!track) return;

    var total = (state.groups[state.active] || []).length;
    var pv = perView();
    var max = Math.max(0, total - pv);
    if (state.index > max) state.index = max;
    if (state.index < 0) state.index = 0;

    track.style.setProperty('--pv-per-view', pv);
    track.classList.toggle('is-static', total <= pv);
    track.style.transform = max === 0 ? 'none' : 'translateX(' + (-state.index * (100 / pv)) + '%)';

    var needNav = max > 0;
    [prev, next].forEach(function (b) { if (b) b.classList.toggle('is-hidden', !needNav); });
    if (prev) prev.disabled = !needNav || state.index <= 0;
    if (next) next.disabled = !needNav || state.index >= max;
  }

  function selectTab(key) {
    var root = document.getElementById('partners-section');
    if (!root || key === state.active) return;
    state.active = key;
    renderTabs(root);
    renderTrack(root);
  }

  function move(delta) {
    var root = document.getElementById('partners-section');
    if (!root) return;
    state.index += delta;
    updateCarousel(root);
  }

  function bindControls(root) {
    var prev = $(root, '[data-partners-prev]');
    var next = $(root, '[data-partners-next]');
    var view = $(root, '[data-partners-viewport]');

    if (prev && !prev._pvBound) {
      prev._pvBound = true;
      prev.addEventListener('click', function () { move(-1); });
    }
    if (next && !next._pvBound) {
      next._pvBound = true;
      next.addEventListener('click', function () { move(1); });
    }

    // Vuốt trên điện thoại
    if (view && !view._pvBound) {
      view._pvBound = true;
      var x0 = 0;
      view.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].screenX; }, { passive: true });
      view.addEventListener('touchend', function (e) {
        var d = x0 - e.changedTouches[0].screenX;
        if (d > 50) move(1);
        else if (d < -50) move(-1);
      }, { passive: true });
    }

    if (!state.resizeBound) {
      state.resizeBound = true;
      global.addEventListener('resize', function () {
        clearTimeout(state.resizeTimer);
        state.resizeTimer = setTimeout(function () {
          var r = document.getElementById('partners-section');
          if (r && !r.hidden) updateCarousel(r);
        }, 150);
      });
    }
  }

  // ---------------------------------------------------------------
  // Khởi tạo
  // ---------------------------------------------------------------
  async function init() {
    var root = document.getElementById('partners-section');
    if (!root) return;

    if (!global.PVDB) {
      console.warn('[partners-loader] Thiếu pv-sqlite.js – hãy nạp assets/js/pv-sqlite.js trước partners-loader.js');
      return;
    }

    var rows;
    try {
      rows = await global.PVDB.getPosts('partners');
    } catch (e) {
      console.warn('[partners-loader] Không đọc được posts_partners từ website.db:', e);
      return;
    }

    var groups = {};
    var labels = {};
    (rows || []).forEach(function (r) {
      if (!r || !r.category) return;
      (groups[r.category] = groups[r.category] || []).push(r);
      if (r.categoryLabel && !labels[r.category]) labels[r.category] = String(r.categoryLabel);
    });

    state.groups = groups;
    state.tabs = TABS.filter(function (t) { return groups[t.key] && groups[t.key].length; })
      .map(function (t) { return { key: t.key, label: labels[t.key] || t.label }; });

    if (!state.tabs.length) {           // chưa có dữ liệu -> ẩn cả mục
      root.hidden = true;
      return;
    }

    injectStyle();
    root.hidden = false;
    state.active = state.tabs[0].key;
    state.index = 0;

    bindControls(root);
    renderTabs(root);
    renderTrack(root);
  }

  global.initHomePartners = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
