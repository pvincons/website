// ==========================================
// 1. CẤU HÌNH BÀI VIẾT TRANG CHỦ THEO ID
// ==========================================
// Điền danh sách ID các bài viết bạn muốn hiển thị trên trang chủ (index.html) tại đây
const HOME_FEATURED_IDS = ["1", "2", "3", "4", "5", "6"];

// Cấu hình Formspree
const FORMSPREE_URL = "https://formspree.io/f/xzdnldga"; 

// ==========================================
// 2. TẢI HEADER & FOOTER (ĐÃ SỬA LỖI MẤT HEADER/FOOTER)
// ==========================================
async function loadLayout(pageId) {
    try {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // Tải Header nếu có vị trí cắm (placeholder)
        if (headerPlaceholder) {
            const headerRes = await fetch('header.html');
            if (headerRes.ok) {
                const headerHtml = await headerRes.text();
                headerPlaceholder.outerHTML = headerHtml;
            }
        }

        // Tải Footer nếu có vị trí cắm (placeholder)
        if (footerPlaceholder) {
            const footerRes = await fetch('footer.html');
            if (footerRes.ok) {
                const footerHtml = await footerRes.text();
                footerPlaceholder.innerHTML = footerHtml;
            }
        }

        // Khởi tạo nút Toggle Menu Mobile
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.onclick = () => mobileMenu.classList.toggle('hidden');
        }

        // Cập nhật trạng thái Menu active
        updateActiveTab(pageId);

        // Tải danh sách bài viết nếu đang ở trang chủ
        if (!pageId || pageId === 'index') {
            loadHomeNews();
        }

    } catch (error) {
        console.error('Lỗi khi nạp Header/Footer:', error);
    }
}
window.loadLayout = loadLayout;

// ==========================================
// 3. NẠP TIN TỨC TRANG CHỦ (LỌC THEO ID BÀI VIẾT)
// ==========================================
async function loadHomeNews() {
    const placeholder = document.getElementById('latest-news-placeholder');
    if (!placeholder) return;

    let articlesData = [];

    // Tải dữ liệu từ assets/js/news-loader.js
    try {
        const loaderRes = await fetch('assets/js/news-loader.js');
        if (loaderRes.ok) {
            const jsText = await loaderRes.text();
            const match = jsText.match(/(?:const|let|var)\s+\w+\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/);
            if (match && match[1]) {
                articlesData = new Function(`return ${match[1]}`)();
            }
        }
    } catch (err) {
        console.warn('Không đọc được news-loader.js:', err);
    }

    // Tải dự phòng từ file JSON nếu chưa lấy được dữ liệu
    if (!articlesData || articlesData.length === 0) {
        const jsonPaths = ['assets/data/news.json', 'data/news.json', 'news.json'];
        for (const path of jsonPaths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    articlesData = await res.json();
                    break;
                }
            } catch (e) {}
        }
    }

    if (!Array.isArray(articlesData) || articlesData.length === 0) return;

    // Lọc bài viết khớp với danh sách HOME_FEATURED_IDS
    let selectedArticles = [];
    if (typeof HOME_FEATURED_IDS !== 'undefined' && HOME_FEATURED_IDS.length > 0) {
        selectedArticles = articlesData.filter(item => HOME_FEATURED_IDS.includes(String(item.id)));
    }

    // Phương án dự phòng: Lấy thuộc tính featured hoặc 3 bài mới nhất nếu ID không khớp
    if (selectedArticles.length === 0) {
        selectedArticles = articlesData.filter(item => item.featured === true || item.pinHome === true);
    }
    if (selectedArticles.length === 0) {
        selectedArticles = articlesData.slice(0, 3);
    }

    // Render danh sách bài viết hàng dọc đúng khung giao diện
    placeholder.innerHTML = `
        <div class="flex flex-col gap-5 w-full max-w-4xl mx-auto">
            ${selectedArticles.map(item => `
                <article class="w-full bg-slate-50/60 hover:bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-300 p-3.5 sm:p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <!-- Ảnh đại diện + Tag -->
                    <div class="relative w-full sm:w-5/12 h-44 sm:h-36 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                        <img src="${item.image || item.img || 'assets/pic/PC_01.webp'}" 
                             alt="${item.title || ''}" 
                             class="w-full h-full object-cover hover:scale-105 transition duration-500">
                        <span class="absolute top-3 left-3 bg-brand-blue text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            ${item.category || item.tag || 'CÔNG NGHỆ'}
                        </span>
                    </div>

                    <!-- Nội dung bài viết -->
                    <div class="flex-1 flex flex-col justify-between w-full h-full py-1">
                        <div>
                            <div class="flex items-center gap-1.5 text-brand-blue font-bold text-xs mb-2">
                                <i class="fa-regular fa-calendar"></i>
                                <span>${item.date || '14/08/2026'}</span>
                            </div>
                            <h3 class="text-base sm:text-lg font-extrabold text-slate-800 leading-snug tracking-tight hover:text-brand-orange transition line-clamp-2 uppercase">
                                <a href="${item.link || item.url || `news-detail.html?id=${item.id}`}">${item.title}</a>
                            </h3>
                        </div>

                        <!-- Nút Xem chi tiết -->
                        <div class="flex justify-end mt-4 sm:mt-2">
                            <a href="${item.link || item.url || `news-detail.html?id=${item.id}`}" 
                               class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white hover:bg-brand-blue text-slate-700 hover:text-white border border-slate-200 text-xs font-bold transition-all shadow-xs">
                                Xem <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `).join('')}
        </div>
    `;
}

// ==========================================
// 4. CÁC HÀM PHỤ TRỢ (LANGUAGE, ACTIVE TAB, SCROLL, FORM)
// ==========================================
function updateActiveTab(pageId) {
    const normalizedPageId = (!pageId || pageId === 'index') ? 'index' : pageId;
    document.querySelectorAll('[data-tab]').forEach(el => {
        if (el.classList.contains('nav-tab-btn')) {
            el.classList.remove('border-brand-blue', 'text-brand-blue');
            el.classList.add('border-transparent', 'text-slate-600');
        }
    });
    document.querySelectorAll(`[data-tab="${normalizedPageId}"]`).forEach(el => {
        if (el.classList.contains('nav-tab-btn')) {
            el.classList.add('border-brand-blue', 'text-brand-blue');
            el.classList.remove('border-transparent', 'text-slate-600');
        }
    });
}

function initSmoothScroll() {
    if (window._smoothScrollInitialized) return;
    window._smoothScrollInitialized = true;
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// Khởi tạo tự động khi trang đã sẵn sàng
document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    
    // Tự động nạp layout nếu trang có sẵn thẻ placeholder
    if (document.getElementById('header-placeholder') || document.getElementById('footer-placeholder')) {
        loadLayout('index');
    }
});