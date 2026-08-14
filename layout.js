// ==========================================
// 1. CẤU HÌNH LỌC BÀI VIẾT TRANG CHỦ
// ==========================================
const HOME_CATEGORY = "cong-ty"; 
const FORMSPREE_URL = "https://formspree.io/f/xzdnldga"; 

// ==========================================
// 2. TẢI HEADER & FOOTER
// ==========================================
async function loadLayout(pageId) {
    try {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // Tải Header
        if (headerPlaceholder) {
            const headerRes = await fetch('header.html');
            if (headerRes.ok) {
                const headerHtml = await headerRes.text();
                headerPlaceholder.innerHTML = headerHtml;
            }
        }

        // Tải Footer
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

        // Tự động nhận diện & cập nhật tab Active chuẩn theo URL
        updateActiveTab(pageId);

        // Tải danh sách bài viết nếu đang ở trang chủ
        const currentPath = window.location.pathname.split('/').pop().replace('.html', '');
        if (!pageId || pageId === 'index' || currentPath === '' || currentPath === 'index') {
            loadHomeNews();
        }

    } catch (error) {
        console.error('Lỗi khi nạp Header/Footer:', error);
    }
}
window.loadLayout = loadLayout;

// ==========================================
// 3. NẠP TIN TỨC TRANG CHỦ (CỘT NGANG ĐỒNG BỘ)
// ==========================================
async function loadHomeNews() {
    const placeholder = document.getElementById('latest-news-placeholder');
    if (!placeholder) return;

    let articlesData = [];

    try {
        const jsonRes = await fetch('content/posts-news.json');
        if (jsonRes.ok) {
            articlesData = await jsonRes.json();
        }
    } catch (err) {
        console.warn('Không đọc được content/posts-news.json:', err);
    }

    if (!articlesData || articlesData.length === 0) {
        try {
            const loaderRes = await fetch('assets/js/news-loader.js');
            if (loaderRes.ok) {
                const jsText = await loaderRes.text();
                const match = jsText.match(/(?:const|let|var)\s+\w+\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/);
                if (match && match[1]) {
                    articlesData = new Function(`return ${match[1]}`)();
                }
            }
        } catch (e) {}
    }

    if (!Array.isArray(articlesData) || articlesData.length === 0) return;

    let selectedArticles = articlesData.filter(item => 
        item.category === HOME_CATEGORY || 
        (item.category && item.category.toLowerCase().includes('cong-ty'))
    );

    selectedArticles.sort((a, b) => Number(b.id) - Number(a.id));

    if (selectedArticles.length === 0) {
        selectedArticles = articlesData.slice(0, 3);
    }

    placeholder.innerHTML = `
        <div class="flex flex-col gap-5 w-full max-w-4xl mx-auto">
            ${selectedArticles.map(item => {
                const articleUrl = item.link || item.url || `news-detail.html?id=${item.id}`;
                return `
                <article onclick="window.location.href='${articleUrl}'" 
                         class="bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-blue/50 transition-all duration-300 flex flex-row items-stretch min-h-[130px] sm:min-h-[200px] cursor-pointer group">
                    
                    <div class="w-[40%] sm:w-1/3 lg:w-2/5 relative shrink-0">
                        <img src="${item.image || item.img || 'assets/pic/PC_01.webp'}" 
                             class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                             alt="${item.title || ''}">
                        <span class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-brand-blue text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-sm">
                            ${item.categoryLabel || 'CÔNG NGHỆ'}
                        </span>
                    </div>

                    <div class="w-[60%] sm:w-2/3 lg:w-3/5 p-3 sm:p-6 flex flex-col justify-between">
                        <div>
                            <span class="text-[10px] sm:text-xs text-brand-blue font-semibold">
                                <i class="fa-regular fa-calendar mr-1"></i> ${item.date || '14/08/2026'}
                            </span>
                            
                            <h3 class="font-bold text-[13px] leading-snug sm:text-lg text-slate-900 mt-1 sm:mt-2 mb-1 sm:mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors text-justify">
                                ${item.title}
                            </h3>

                            <p class="text-slate-600 text-[11px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 text-justify mt-1">
                                ${item.summary || ''}
                            </p>
                        </div>

                        <div class="mt-2 sm:mt-5 flex justify-end">
                            <span class="text-brand-blue group-hover:text-brand-orange text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors py-1.5 px-2.5 sm:py-2 sm:px-4 rounded bg-slate-50 border border-slate-200 group-hover:border-brand-orange shadow-sm">
                                Xem <span class="hidden sm:inline">chi tiết</span> <i class="fa-solid fa-arrow-right text-[8px] sm:text-[10px]"></i>
                            </span>
                        </div>
                    </div>
                </article>
                `;
            }).join('')}
        </div>
    `;
}

// ==========================================
// 4. HÀM TỰ ĐỘNG CẬP NHẬT TAB ACTIVE & HOVER
// ==========================================
function updateActiveTab(pageId) {
    // 1. Tự lấy tên file từ URL hiện tại nếu pageId truyền vào không có hoặc mặc định là 'index'
    const path = window.location.pathname;
    let realPage = path.split('/').pop().replace('.html', '').toLowerCase();
    
    if (!realPage || realPage === '') {
        realPage = 'index';
    }

    // Nếu tham số pageId được truyền rõ ràng khác 'index', ưu tiên theo tham số đó
    const currentPage = (pageId && pageId !== 'index') ? pageId : realPage;

    // 2. Tìm tất cả các liên kết trong menu Navigation
    const navLinks = document.querySelectorAll('header nav a, [data-tab]');
    
    navLinks.forEach(el => {
        const tabAttr = (el.getAttribute('data-tab') || '').toLowerCase();
        const hrefAttr = (el.getAttribute('href') || '').toLowerCase();

        // Kiểm tra đường dẫn có khớp với trang hiện tại hay không
        const isMatch = (tabAttr === currentPage) || 
                        (hrefAttr.includes(currentPage + '.html')) ||
                        (currentPage === 'index' && (tabAttr === 'index' || hrefAttr === 'index.html' || hrefAttr === './' || hrefAttr === '/'));

        if (isMatch) {
            // Hiệu ứng TAB ĐANG CHỌN (Active): Màu xanh + Gạch chân dưới
            el.classList.add('border-brand-blue', 'text-brand-blue', 'font-bold');
            el.classList.remove('border-transparent', 'text-slate-600', 'text-slate-700');
        } else {
            // Hiệu ứng TAB THƯỜNG: Màu xám, di chuột vào (Hover) tự sáng xanh
            el.classList.remove('border-brand-blue', 'text-brand-blue', 'font-bold');
            el.classList.add('border-transparent', 'text-slate-600', 'hover:text-brand-blue', 'hover:border-brand-blue/50');
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

// ==========================================
// 5. TỰ ĐỘNG NHẬN DIỆN TRANG VÀ LẠO LAYOUT
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    
    // Đọc tên trang thực tế từ URL trình duyệt
    const path = window.location.pathname;
    let autoDetectedPage = path.split('/').pop().replace('.html', '');
    if (!autoDetectedPage || autoDetectedPage === '') autoDetectedPage = 'index';

    // Gọi loadLayout với đúng tên trang hiện tại
    if (document.getElementById('header-placeholder') || document.getElementById('footer-placeholder')) {
        loadLayout(autoDetectedPage);
    }
});