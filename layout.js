// ==========================================
// CẤU HÌNH CỔNG GỬI MAIL FORMSPREE
// ==========================================
const FORMSPREE_URL = "https://formspree.io/f/xzdnldga"; 

// ==========================================
// CHỨC NĂNG ĐỔI NGÔN NGỮ (GLOBAL LANGUAGE SWITCHER)
// ==========================================
window.toggleLanguage = function () {
    const isEn = document.cookie.indexOf('googtrans=/vi/en') !== -1 || document.cookie.indexOf('/en') !== -1;
    const host = location.hostname;
    const rootDomain = host.replace(/^www\./, '');
    const pastDate = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    
    // Kiểm tra nếu là localhost hoặc IP thì không gán domain trong cookie
    const isLocal = host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host);
    const domainStr = isLocal ? "" : " domain=." + rootDomain + ";";

    if (isEn) {
        document.cookie = "googtrans=; " + pastDate;
        document.cookie = "googtrans=; path=/;" + domainStr + " " + pastDate;
    } else {
        document.cookie = "googtrans=/vi/en; path=/;";
        if (!isLocal) {
            document.cookie = "googtrans=/vi/en; path=/; domain=." + rootDomain + ";";
        }
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
                fetch('header.html'),
                fetch('footer.html')
            ]);

            const headerHtml = await headerRes.text();
            const footerHtml = await footerRes.text();

            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) headerPlaceholder.outerHTML = headerHtml;

            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;
        }

        // Đảm bảo gán sự kiện Toggle Mobile Menu bất kể Header được fetch hay có sẵn
        initMobileMenu();
        updateActiveTab(pageId);

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
        mobileMenuBtn._hasListener = true; // Tránh gán lặp sự kiện
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

function closeModal() {
    closeContactModal();
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
// THỐNG KÊ LƯỢT TRUY CẬP
// ==========================================
async function initVisitorCounter() {
    const totalVisitsEl = document.getElementById('totalVisits');
    const onlineVisitorsEl = document.getElementById('onlineVisitors');

    if (!totalVisitsEl && !onlineVisitorsEl) return;

    const NAMESPACE = 'pvincons_construct_2026';
    const KEY = 'total_visits';

    try {
        let endpoint = `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/`;

        if (!sessionStorage.getItem('pv_counted_session')) {
            endpoint += 'up/';
            sessionStorage.setItem('pv_counted_session', 'true');
        }

        const response = await fetch(endpoint);
        if (response.ok) {
            const data = await response.json();
            const BASE_OFFSET = 12000;
            const finalTotal = (data.count || 0) + BASE_OFFSET;
            if (totalVisitsEl) {
                totalVisitsEl.innerText = Number(finalTotal).toLocaleString('vi-VN');
            }
            if (onlineVisitorsEl) {
                onlineVisitorsEl.innerText = Math.floor(Math.random() * 5) + 3;
            }
        } else {
            throw new Error('Lỗi phản hồi API');
        }
    } catch (error) {
        if (totalVisitsEl) totalVisitsEl.innerText = '12.000';
        if (onlineVisitorsEl) onlineVisitorsEl.innerText = '5';
    }
}

// ==========================================
// KHỞI TẠO TỰ ĐỘNG KHI TẢI TRANG
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('google_translate_element')) {
        const translateDiv = document.createElement('div');
        translateDiv.id = 'google_translate_element';
        translateDiv.style.display = 'none';
        document.body.appendChild(translateDiv);

        const translateScript = document.createElement('script');
        translateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(translateScript);
    }

    initSmoothScroll();

    // Kiểm tra an toàn trước khi gọi hàm đếm
    if (typeof initVisitorCounter === 'function') {
        setTimeout(initVisitorCounter, 300);
    }
});