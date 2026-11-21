// ==========================================
// CẤU HÌNH CỔNG GỬI MAIL FORMSPREE
// ==========================================
const FORMSPREE_URL = "https://formspree.io/f/xzdnldga"; 

// ==========================================
// TIỆN ÍCH COOKIE + ĐỒNG Ý COOKIE (COOKIE CONSENT)
// ==========================================
// Cookie ghi nhớ lựa chọn: pv_cookie_consent = 'accepted' | 'necessary' (sống 180 ngày)
//  - 'necessary': chỉ dùng cookie cần thiết (vd: googtrans ghi nhớ ngôn ngữ)
//  - 'accepted' : cho phép thêm cookie không bắt buộc (thống kê, quảng cáo...)
// Khi sau này thêm Google Analytics/Pixel: chỉ nạp script khi PVCookie.allowsOptional() === true
// hoặc lắng nghe sự kiện 'pv:cookie-consent' (xem ví dụ ở cuối khối này).
const PVCookie = (function () {
    const CONSENT_NAME = 'pv_cookie_consent';
    const CONSENT_DAYS = 180;

    function set(name, value, opts) {
        opts = opts || {};
        let c = name + '=' + (opts.raw ? value : encodeURIComponent(value)) + '; path=/; SameSite=Lax';
        if (typeof opts.days === 'number') c += '; max-age=' + Math.round(opts.days * 86400);
        if (opts.domain) c += '; domain=' + opts.domain;
        if (location.protocol === 'https:') c += '; Secure';
        document.cookie = c;
    }

    function get(name) {
        const prefix = name + '=';
        const part = document.cookie.split('; ').find(function (row) { return row.indexOf(prefix) === 0; });
        if (!part) return null;
        const raw = part.slice(prefix.length);
        try { return decodeURIComponent(raw); } catch (e) { return raw; }
    }

    function remove(name, domain) {
        document.cookie = name + '=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
            (domain ? '; domain=' + domain : '');
    }

    function getConsent() {
        const v = get(CONSENT_NAME);
        return (v === 'accepted' || v === 'necessary') ? v : null;
    }

    function setConsent(status) {
        set(CONSENT_NAME, status, { days: CONSENT_DAYS });
        document.dispatchEvent(new CustomEvent('pv:cookie-consent', { detail: { status: status } }));
    }

    function allowsOptional() {
        return getConsent() === 'accepted';
    }

    return { set: set, get: get, remove: remove, getConsent: getConsent, setConsent: setConsent, allowsOptional: allowsOptional };
})();
window.PVCookie = PVCookie;

/* Ví dụ nạp Google Analytics SAU KHI người dùng đồng ý (bỏ comment và thay ID khi cần):
function loadAnalytics() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
}
if (PVCookie.allowsOptional()) loadAnalytics();
document.addEventListener('pv:cookie-consent', function (e) {
    if (e.detail.status === 'accepted') loadAnalytics();
});
*/

// ==========================================
// CHỨC NĂNG ĐỔI NGÔN NGỮ (GLOBAL LANGUAGE SWITCHER)
// ==========================================
// Trang đang ở chế độ dịch sang tiếng Anh? (cookie googtrans do Google Translate đọc)
function isTranslatedToEn() {
    return /(?:^|;\s*)googtrans=\/[\w-]+\/en(?:;|$)/.test(document.cookie);
}

window.toggleLanguage = function () {
    const host = location.hostname;
    const rootDomain = host.replace(/^www\./, '');

    // localhost hoặc IP thì không gán domain trong cookie
    const isLocal = host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host);
    const domains = isLocal ? [null] : [null, '.' + rootDomain];

    if (isTranslatedToEn()) {
        domains.forEach(function (d) { PVCookie.remove('googtrans', d); });
    } else {
        // googtrans là cookie chức năng (người dùng chủ động bấm đổi ngôn ngữ) nên không cần chờ đồng ý.
        // Giữ nguyên giá trị thô "/vi/en" để Google Translate đọc được.
        domains.forEach(function (d) { PVCookie.set('googtrans', '/vi/en', { raw: true, domain: d }); });
    }
    location.reload();
};

window.googleTranslateElementInit = function () {
    if (typeof google !== 'undefined' && google.translate) {
        new google.translate.TranslateElement({
            pageLanguage: 'vi',
            includedLanguages: 'en,vi',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    }
};

// ==========================================
// CẬP NHẬT TRẠNG THÁI TAB ACTIVE TRÊN MENU
// ==========================================
function updateActiveTab(pageId) {
    const normalizedPageId = (!pageId || pageId === 'index') ? 'index' : pageId;
    const allTabs = document.querySelectorAll('[data-tab]');

    allTabs.forEach(el => {
        if (el.classList.contains('nav-tab-btn')) {
            el.classList.remove('border-brand-blue', 'text-brand-blue');
            el.classList.add('border-transparent', 'text-slate-600');
        }
        if (el.classList.contains('mobile-tab-btn')) {
            el.classList.remove('text-brand-blue', 'bg-blue-50');
            el.classList.add('text-slate-700');
        }
    });

    const activeTabs = document.querySelectorAll(`[data-tab="${normalizedPageId}"]`);
    activeTabs.forEach(el => {
        if (el.classList.contains('nav-tab-btn')) {
            el.classList.add('border-brand-blue', 'text-brand-blue');
            el.classList.remove('border-transparent', 'text-slate-600');
        }
        if (el.classList.contains('mobile-tab-btn')) {
            el.classList.add('text-brand-blue', 'bg-blue-50');
            el.classList.remove('text-slate-700');
        }
    });
}

// ==========================================
// CHỨC NĂNG CUỘN TRANG MƯỢT MÀ VỚI LIÊN KẾT NỘI TRANG (#)
// ==========================================
function initSmoothScroll() {
    if (window._smoothScrollInitialized) return;
    window._smoothScrollInitialized = true;

    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;

        const navContainer = anchor.closest('nav');
        if (navContainer) {
            const navLinks = navContainer.querySelectorAll('a[href^="#"]');
            navLinks.forEach(link => {
                link.classList.remove('text-brand-orange');
                link.classList.add('text-slate-600');
            });
            anchor.classList.add('text-brand-orange');
            anchor.classList.remove('text-slate-600');
        }

        if (href === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href.startsWith('#') && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// ==========================================
// NẠP HEADER / FOOTER DỰ ÁN
// ==========================================
async function loadLayout(pageId) {
    try {
        if (!document.querySelector('header')) {
            const [headerRes, footerRes] = await Promise.all([
                fetch('/header.html'),
                fetch('/footer.html')
            ]);

            // Kiểm tra nếu file không tồn tại (lỗi 404)
            if (!headerRes.ok || !footerRes.ok) {
                throw new Error(`Không thể tải layout (Header: ${headerRes.status}, Footer: ${footerRes.status})`);
            }

            const headerHtml = await headerRes.text();
            const footerHtml = await footerRes.text();

            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) headerPlaceholder.outerHTML = headerHtml;

            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) footerPlaceholder.outerHTML = footerHtml; // Thống nhất dùng outerHTML
        }

        initMobileMenu();
        updateActiveTab(pageId);
        initVisitorCounter();

    } catch (error) {
        console.error('Lỗi khi nạp Header/Footer:', error);
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu && !mobileMenuBtn._hasListener) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        mobileMenuBtn._hasListener = true;
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
}

// ==========================================
// FORM POPUP CHUẨN FORMSPREE
// ==========================================
function getMasterModalHtml() {
    return `
    <div id="contactModal" class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto">
            <button type="button" onclick="closeContactModal()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-xl font-bold p-2 focus:outline-none cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <h3 class="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Thông Tin Liên Hệ</h3>

            <form id="contactForm" action="${FORMSPREE_URL}" method="POST" onsubmit="submitContactForm(event)" class="space-y-4">
                <div>
                    <input type="text" name="Họ_và_tên" required placeholder="Họ và Tên *" 
                        class="w-full px-4 py-3.5 text-slate-800 bg-[#edf3fc] border border-transparent rounded-xl focus:outline-none focus:border-brand-blue focus:bg-white transition text-sm placeholder-slate-500 font-normal">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <input type="tel" name="Số_điện_thoại" required placeholder="Số Điện Thoại *" 
                            class="w-full px-4 py-3.5 text-slate-800 bg-[#edf3fc] border border-transparent rounded-xl focus:outline-none focus:border-brand-blue focus:bg-white transition text-sm placeholder-slate-500 font-normal">
                    </div>
                    <div>
                        <input type="text" name="Địa_điểm_công_trình" placeholder="Địa Điểm Công Trình" 
                            class="w-full px-4 py-3.5 text-slate-800 bg-[#edf3fc] border border-transparent rounded-xl focus:outline-none focus:border-brand-blue focus:bg-white transition text-sm placeholder-slate-500 font-normal">
                    </div>
                </div>

                <div>
                    <textarea name="Nội_dung_yêu_cầu" rows="5" placeholder="Nội dung yêu cầu..." 
                        class="w-full px-4 py-3.5 text-slate-800 bg-[#edf3fc] border border-transparent rounded-xl focus:outline-none focus:border-brand-blue focus:bg-white transition text-sm resize-none placeholder-slate-500 font-normal"></textarea>
                </div>

                <button type="submit" 
                    class="w-full bg-[#1e6091] hover:bg-[#184e77] text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 text-center shadow-md cursor-pointer text-base mt-2">
                    Gửi Thông Tin
                </button>
            </form>
        </div>
    </div>`;
}

function openContactModal() {
    closeContactModal();
    document.body.insertAdjacentHTML('beforeend', getMasterModalHtml());
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.remove();
}

function showThankYouModal() {
    let thankYouModal = document.getElementById('thankYouModal');
    if (!thankYouModal) {
        const modalHtml = `
        <div id="thankYouModal" class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div class="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center border border-slate-100">
                <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Gửi thông tin thành công!</h3>
                <p class="text-slate-600 text-sm mb-6">Cảm ơn Quý khách đã liên hệ với PV INCONS. Chúng tôi sẽ xử lý thông tin và liên hệ với Quý khách trong thời gian sớm nhất.</p>
                <button type="button" onclick="closeModal()" class="w-full bg-brand-blue hover:bg-brand-darkblue text-white font-semibold py-3 rounded-xl transition cursor-pointer text-sm">
                    Đóng
                </button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    } else {
        thankYouModal.classList.remove('hidden');
        thankYouModal.classList.add('flex');
    }
}

// ==========================================
// ĐÓNG TẤT CẢ CÁC POPUP MODAL (FIX LỖI KẸT MODAL)
// ==========================================
function closeModal() {
    closeContactModal();

    if (typeof closeRequestModal === 'function') {
        closeRequestModal();
    } else {
        const reqModal = document.getElementById('requestModal');
        if (reqModal) {
            reqModal.classList.add('hidden');
            reqModal.classList.remove('flex');
        }
    }

    const thankYouModal = document.getElementById('thankYouModal');
    if (thankYouModal) {
        thankYouModal.classList.add('hidden');
        thankYouModal.classList.remove('flex');
    }
}

// ==========================================
// HÀM GỬI DỮ LIỆU TỚI FORMSPREE (AJAX)
// ==========================================
async function submitContactForm(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : 'Gửi Thông Tin';

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Đang gửi...';
    }

    try {
        const actionUrl = form.action && form.action.includes('formspree.io') ? form.action : FORMSPREE_URL;
        const response = await fetch(actionUrl, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            form.reset();
            closeContactModal();
            showThankYouModal();
        } else {
            alert('Có lỗi xảy ra khi gửi dữ liệu. Vui lòng kiểm tra lại kết nối!');
        }
    } catch (error) {
        console.error('Lỗi kết nối Formspree:', error);
        alert('Không thể kết nối máy chủ. Vui lòng kiểm tra lại mạng internet!');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    }
}

// ==========================================
// THỐNG KÊ LƯỢT TRUY CẬP (GIẢ LẬP LOCAL)
// ==========================================
function initVisitorCounter() {
    const totalVisitsEl = document.getElementById('totalVisits');
    const onlineVisitorsEl = document.getElementById('onlineVisitors');

    // Nếu cả 2 đều không có trong DOM thì mới thoát
    if (!totalVisitsEl && !onlineVisitorsEl) return;

    const BASE_VISITS = 12450;
    let addedVisits = parseInt(localStorage.getItem('pv_simulated_visits') || '0', 10);

    if (!sessionStorage.getItem('pv_counted_session')) {
        addedVisits += 1;
        localStorage.setItem('pv_simulated_visits', addedVisits.toString());
        sessionStorage.setItem('pv_counted_session', 'true');
    }

    const finalTotal = BASE_VISITS + addedVisits;

    if (totalVisitsEl) {
        totalVisitsEl.innerText = finalTotal.toLocaleString('vi-VN');
    }

    if (onlineVisitorsEl) {
        const getRandomOnline = () => Math.floor(Math.random() * 8) + 3;
        onlineVisitorsEl.innerText = getRandomOnline();

        setInterval(() => {
            onlineVisitorsEl.innerText = getRandomOnline();
        }, 8000);
    }
}

// ==========================================
// BANNER ĐỒNG Ý COOKIE
// ==========================================
function injectCookieStyles() {
    if (document.getElementById('pvCookieStyles')) return;
    // CSS tự chứa: style.css là bản Tailwind đã biên dịch nên không có sẵn các class mới.
    const css = `
    #pvCookieBanner{position:fixed;left:16px;right:16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:99990;
        max-width:920px;margin:0 auto;box-sizing:border-box;background:#fff;color:#334155;
        border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 12px 40px rgba(15,23,42,.22);
        padding:16px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px 24px;
        font-size:14px;line-height:1.55;opacity:0;transform:translateY(16px);
        transition:opacity .25s ease,transform .25s ease}
    #pvCookieBanner.pvck-visible{opacity:1;transform:none}
    #pvCookieBanner .pvck-text{flex:1 1 360px;min-width:0}
    #pvCookieBanner .pvck-title{display:block;color:#0f172a;font-weight:700;margin-bottom:2px}
    #pvCookieBanner .pvck-text p{margin:0}
    #pvCookieBanner .pvck-text a{color:var(--brand-blue,#1e68a8);text-decoration:underline;text-underline-offset:2px}
    #pvCookieBanner .pvck-status{display:block;margin-top:4px;font-size:12px;color:#64748b}
    #pvCookieBanner .pvck-actions{display:flex;flex:0 0 auto;gap:8px}
    #pvCookieBanner .pvck-btn{font:inherit;font-weight:600;line-height:1.2;cursor:pointer;border-radius:12px;
        padding:11px 18px;border:1px solid transparent;white-space:nowrap;transition:background-color .15s,border-color .15s}
    #pvCookieBanner .pvck-btn:focus-visible,#pvCookieBanner .pvck-text a:focus-visible{outline:2px solid var(--brand-blue,#1e68a8);outline-offset:2px}
    #pvCookieBanner .pvck-btn-ghost{background:#fff;color:#334155;border-color:#cbd5e1}
    #pvCookieBanner .pvck-btn-ghost:hover{background:#f1f5f9}
    #pvCookieBanner .pvck-btn-primary{background:var(--brand-blue,#1e68a8);color:#fff}
    #pvCookieBanner .pvck-btn-primary:hover{background:var(--brand-darkblue,#0d3d6b)}
    @media (max-width:640px){
        #pvCookieBanner{left:10px;right:10px;padding:14px 16px;border-radius:16px}
        #pvCookieBanner .pvck-actions{width:100%}
        #pvCookieBanner .pvck-btn{flex:1 1 0;white-space:normal;padding:11px 10px}
    }
    @media (prefers-reduced-motion:reduce){#pvCookieBanner{transition:none;transform:none}}`;
    const style = document.createElement('style');
    style.id = 'pvCookieStyles';
    style.textContent = css;
    document.head.appendChild(style);
}

function closeCookieBanner() {
    const el = document.getElementById('pvCookieBanner');
    if (!el) return;
    document.removeEventListener('keydown', closeCookieBanner._onKey);
    el.classList.remove('pvck-visible');
    setTimeout(function () { el.remove(); }, 250);
}

// fromUser = true khi người dùng chủ động mở lại từ liên kết "Cài đặt cookie" ở footer
function initCookieBanner(fromUser) {
    const current = PVCookie.getConsent();
    if (current && !fromUser) return;
    if (document.getElementById('pvCookieBanner')) return;

    injectCookieStyles();

    const statusText = current === 'accepted' ? 'Lựa chọn hiện tại: Chấp nhận tất cả'
        : current === 'necessary' ? 'Lựa chọn hiện tại: Chỉ cookie cần thiết' : '';

    const el = document.createElement('div');
    el.id = 'pvCookieBanner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'pvckTitle');
    el.setAttribute('aria-describedby', 'pvckDesc');
    el.innerHTML = `
        <div class="pvck-text">
            <strong class="pvck-title" id="pvckTitle">Website sử dụng cookie</strong>
            <p id="pvckDesc">> để đảm bảo trải nghiệm tốt nhất. Xem thêm <a href="/content/policy/chinh_sach_bao_mat.html">Chính sách quyền riêng tư</a>.</p>
            ${statusText ? '<span class="pvck-status">' + statusText + '</span>' : ''}
        </div>
        <div class="pvck-actions">
            <button type="button" class="pvck-btn pvck-btn-ghost" data-pvck="necessary">Chỉ cookie cần thiết</button>
            <button type="button" class="pvck-btn pvck-btn-primary" data-pvck="accepted">Chấp nhận tất cả</button>
        </div>`;

    el.querySelectorAll('[data-pvck]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            PVCookie.setConsent(btn.getAttribute('data-pvck'));
            closeCookieBanner();
        });
    });

    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('pvck-visible'); });

    if (fromUser) {
        // Mở lại theo yêu cầu: đưa focus vào banner và cho phép đóng bằng phím Esc
        const primary = el.querySelector('.pvck-btn-primary');
        if (primary) primary.focus();
        closeCookieBanner._onKey = function (e) { if (e.key === 'Escape') closeCookieBanner(); };
        document.addEventListener('keydown', closeCookieBanner._onKey);
    }
}

// Gọi từ footer: <button onclick="openCookieSettings()">Cài đặt cookie</button>
window.openCookieSettings = function () { initCookieBanner(true); };

// ==========================================
// KHỞI TẠO TỰ ĐỘNG KHI TẢI TRANG
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    // Chỉ nạp Google Translate khi trang đang ở chế độ dịch (cookie googtrans).
    // Khách xem tiếng Việt sẽ không phải tải script của bên thứ ba.
    if (isTranslatedToEn() && !document.getElementById('google_translate_element')) {
        const translateDiv = document.createElement('div');
        translateDiv.id = 'google_translate_element';
        translateDiv.style.display = 'none';
        document.body.appendChild(translateDiv);

        const translateScript = document.createElement('script');
        translateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(translateScript);
    }

    initSmoothScroll();
    initCookieBanner();
});
