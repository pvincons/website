// ==========================================
// 1. CẤU HÌNH LỌC BÀI VIẾT TRANG CHỦ
// ==========================================
// Tự động lọc tất cả bài viết có category là "cong-ty" lên trang chủ
const HOME_CATEGORY = "cong-ty"; 

// Cấu hình Formspree
const FORMSPREE_URL = "https://formspree.io/f/xzdnldga"; 

// ==========================================
// 2. TẢI HEADER & FOOTER (ĐÃ SỬA LỖI NẠP HEADER/FOOTER)
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
                headerPlaceholder.innerHTML = headerHtml;
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
// 3. NẠP TIN TỨC TRANG CHỦ (CỘT NGANG 100% GIỐNG TRANG TIN TỨC)
// ==========================================
async function loadHomeNews() {
    const placeholder = document.getElementById('latest-news-placeholder');
    if (!placeholder) return;

    let articlesData = [];

    // 1. Lấy dữ liệu trực tiếp từ content/posts-news.json
    try {
        const jsonRes = await fetch('content/posts-news.json');
        if (jsonRes.ok) {
            articlesData = await jsonRes.json();
        }
    } catch (err) {
        console.warn('Không đọc được content/posts-news.json, thử phương án dự phòng:', err);
    }

    // 2. Dự phòng: Tải từ news-loader.js nếu chưa lấy được dữ liệu
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

    // 3. Lọc bài viết có category === "cong-ty"
    let selectedArticles = articlesData.filter(item => 
        item.category === HOME_CATEGORY || 
        (item.category && item.category.toLowerCase().includes('cong-ty'))
    );

    // Sắp xếp bài viết mới nhất lên đầu (theo ID giảm dần)
    selectedArticles.sort((a, b) => Number(b.id) - Number(a.id));

    // Dự phòng: Lấy 3 bài mới nhất nếu không có bài nào thuộc category cong-ty
    if (selectedArticles.length === 0) {
        selectedArticles = articlesData.slice(0, 3);
    }

    // 4. Render danh sách bài viết dạng hàng ngang (Mobile & Desktop)
    placeholder.innerHTML = `
        <div class="flex flex-col gap-5 w-full max-w-4xl mx-auto">
            ${selectedArticles.map(item => {
                const articleUrl = item.link || item.url || `news-detail.html?id=${item.id}`;
                return `
                <article onclick="window.location.href='${articleUrl}'" 
                         class="bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-blue/50 transition-all duration-300 flex flex-row items-stretch min-h-[130px] sm:min-h-[200px] cursor-pointer group">
                    
                    <!-- Hình ảnh đại diện (Bên trái: 40% Mobile, 33%-40% Desktop) -->
                    <div class="w-[40%] sm:w-1/3 lg:w-2/5 relative shrink-0">
                        <img src="${item.image || item.img || 'assets/pic/PC_01.webp'}" 
                             class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                             alt="${item.title || ''}">
                        <span class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-brand-blue text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-sm">
                            ${item.categoryLabel || 'CÔNG NGHỆ'}
                        </span>
                    </div>

                    <!-- Mảng chữ và nội dung (Bên phải) -->
                    <div class="w-[60%] sm:w-2/3 lg:w-3/5 p-3 sm:p-6 flex flex-col justify-between">
                        <div>
                            <!-- Ngày đăng -->
                            <span class="text-[10px] sm:text-xs text-brand-blue font-semibold">
                                <i class="fa-regular fa-calendar mr-1"></i> ${item.date || '14/08/2026'}
                            </span>
                            
                            <!-- Tiêu đề (Canh đều) -->
                            <h3 class="font-bold text-[13px] leading-snug sm:text-lg text-slate-900 mt-1 sm:mt-2 mb-1 sm:mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors text-justify">
                                ${item.title}
                            </h3>

                            <!-- Mô tả tóm tắt (Canh đều) -->
                            <p class="text-slate-600 text-[11px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 text-justify mt-1">
                                ${item.summary || ''}
                            </p>
                        </div>

                        <!-- Nút xem chi tiết -->
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
// 4. CÁC HÀM PHỤ TRỢ (ACTIVE TAB, SCROLL)
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