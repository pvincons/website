// ==========================================
// CẤU HÌNH CỔNG GỬI MAIL FORMSPREE
// ==========================================
const FORMSPREE_URL = "https://formspree.io/f/xzdnldga"; 

// ==========================================
// CHỨC NĂNG ĐỔI NGÔN NGỮ (GLOBAL LANGUAGE SWITCHER)
// ==========================================
window.toggleLanguage = function () {
    var isEn = document.cookie.indexOf('/en') !== -1;
    var host = location.hostname;
    var rootDomain = host.replace(/^www\./, '');

    if (isEn) {
        var pastDate = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        document.cookie = "googtrans=; " + pastDate;
        document.cookie = "googtrans=; domain=" + host + "; " + pastDate;
        document.cookie = "googtrans=; domain=." + rootDomain + "; " + pastDate;
    } else {
        document.cookie = "googtrans=/vi/en; path=/;";
        document.cookie = "googtrans=/vi/en; path=/; domain=" + host + ";";
        document.cookie = "googtrans=/vi/en; path=/; domain=." + rootDomain + ";";
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
// HÀM HỖ TRỢ CHẠY LẠI SCRIPT TRONG NỘI DUNG MỚI NẠP
// ==========================================
function reexecuteScripts(container) {
    if (!container) return;
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        if (oldScript.parentNode) {
            oldScript.parentNode.replaceChild(newScript, oldScript);
        }
    });
}

// ==========================================
// BỘ NHỚ TẠM (TAB CACHE) & CLIENT-SIDE ROUTER
// ==========================================
const tabCache = {};

function updateActiveTab(pageId) {
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

    const activeTabs = document.querySelectorAll(`[data-tab="${pageId}"]`);
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

function initClientRouter() {
    if (window._routerInitialized) return;
    window._routerInitialized = true;

    document.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        const isHomePage = href === 'index.html' || href === '/' || href.endsWith('/index.html');

        if (isHomePage) {
            e.preventDefault();
            const currentPath = window.location.pathname;
            if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '') {
                window.location.reload();
            } else {
                window.location.href = 'index.html';
            }
            return;
        }

        if (href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('#') && link.target !== '_blank') {
            e.preventDefault();
            const targetUrl = new URL(href, window.location.origin).pathname;
            if (window.location.pathname === targetUrl) return;

            await navigateToPage(targetUrl);
        }
    });

    window.addEventListener('popstate', () => {
        navigateToPage(window.location.pathname, false);
    });
}

async function navigateToPage(url, pushState = true) {
    const mainContent = document.querySelector('main');

    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(4px)';
        mainContent.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    }

    setTimeout(async () => {
        try {
            let htmlText = tabCache[url];

            if (!htmlText) {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Không thể tải trang');
                htmlText = await response.text();
                tabCache[url] = htmlText;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const newMain = doc.querySelector('main');
            const newTitle = doc.querySelector('title');

            if (newMain && mainContent) {
                mainContent.innerHTML = newMain.innerHTML;
                reexecuteScripts(mainContent);
            }
            if (newTitle) {
                document.title = newTitle.text;
            }

            const pageId = url.split('/').pop().replace('.html', '') || 'index';
            updateActiveTab(pageId);

            if (pushState) {
                window.history.pushState({}, '', url);
            }

            closeMobileMenu();
            window.scrollTo({ top: 0, behavior: 'instant' });

            if (pageId === 'about' || url.includes('about')) {
                if (typeof window.initAboutPage === 'function') {
                    window.initAboutPage();
                }
                setTimeout(() => {
                    if (typeof window.forceCenterOrgChart === 'function') {
                        window.forceCenterOrgChart();
                    }
                }, 180);
            }

            if (pageId === 'index' || pageId === '' || url.includes('index')) {
                loadHomeNews();
                if (typeof window.initHomeSlider === 'function') {
                    window.initHomeSlider();
                }
            } else {
                if (window.homeSliderInterval) {
                    clearInterval(window.homeSliderInterval);
                }
            }

            initVisitorCounter();

            window.dispatchEvent(new Event('DOMContentLoaded'));
            window.dispatchEvent(new Event('scroll'));

            if (typeof AOS !== 'undefined') {
                AOS.refreshHard();
            }

            if (mainContent) {
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateY(0)';
            }

        } catch (error) {
            console.error('Lỗi chuyển tab:', error);
            window.location.href = url;
        }
    }, 150);
}

// ==========================================
// CHỨC NĂNG CUỘN TRANG MƯỢT MÀ & ĐỔI MÀU SUB-NAV TAB
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
            if (headerPlaceholder) {
                headerPlaceholder.outerHTML = headerHtml;
            }

            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = footerHtml;
            }

            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }

            initClientRouter();
        }

        updateActiveTab(pageId);

    } catch (error) {
        console.error('Lỗi khi nạp Header/Footer:', error);
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
}

// ==========================================
// TỰ ĐỘNG LẤY TIN TỨC CHO INDEX.HTML
// ==========================================
async function loadHomeNews() {
    const placeholder = document.getElementById('latest-news-placeholder');
    if (!placeholder) return;

    try {
        const response = await fetch('news.html');
        if (!response.ok) return;
        const htmlText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const newsContent = doc.querySelector('#news-container');

        if (newsContent) {
            placeholder.innerHTML = newsContent.innerHTML;
        }
    } catch (error) {
        console.error('Lỗi đồng bộ tin tức:', error);
    }
}

// ==========================================
// ÉP DỰNG FORM POPUP CHUẨN FORMSPREE
// (Chỉnh chữ nét normal rõ ràng)
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
    document.querySelectorAll('#contactModal').forEach(el => el.remove());
    document.body.insertAdjacentHTML('beforeend', getMasterModalHtml());
}

function closeContactModal() {
    document.querySelectorAll('#contactModal').forEach(el => el.remove());
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
                <h3 class="text-xl font-bold text-slate-800 mb-2">Gửi Thông Tin Thành Công!</h3>
                <p class="text-slate-600 text-sm mb-6">Cảm ơn Quý khách đã liên hệ với PV INCONS. Chúng tôi sẽ xử lý thông tin và liên hệ lại trong thời gian sớm nhất.</p>
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
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 
                'Accept': 'application/json' 
            }
        });

        if (response.ok) {
            form.reset();
            closeContactModal();
            showThankYouModal();
        } else {
            alert('Có lỗi xảy ra khi gửi dữ liệu qua Formspree. Vui lòng kiểm tra lại kết nối!');
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
        } else {
            throw new Error('Lỗi phản hồi API');
        }
    } catch (error) {
        if (totalVisitsEl) {
            totalVisitsEl.innerText = '12.000';
        }
    }
}

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
    setTimeout(initVisitorCounter, 300);
    loadHomeNews();
});