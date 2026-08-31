const ITEMS_PER_PAGE = 6;  // Sửa số tin đăng (6) thành số .... mong muốn tại đây
let categoriesData = {};
let currentPages = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('content/posts-news.json')
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file posts-news.json');
            return response.json();
        })
        .then(posts => {
            // Sắp xếp bài viết theo ngày tháng giảm dần (dd/mm/yyyy)
            posts.sort((a, b) => {
                const [dayA, monthA, yearA] = a.date.split('/').map(Number);
                const [dayB, monthB, yearB] = b.date.split('/').map(Number);
                
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                
                return dateB - dateA;
            }); 

            // Khởi tạo các section tin tức và phân trang
            initNewsSections(posts);
        })
        .catch(error => console.error('Lỗi nạp tin tức:', error));
});

function initNewsSections(posts) {
    categoriesData = {};
    currentPages = {};

    // 1. Phân loại data vào các danh mục dựa trên post.category
    posts.forEach(post => {
        if (!categoriesData[post.category]) {
            categoriesData[post.category] = [];
        }
        categoriesData[post.category].push(post);
    });

    // 2. Hiển thị trang 1 cho tất cả danh mục trên giao diện
    Object.keys(categoriesData).forEach(categoryKey => {
        const container = document.querySelector(`[data-category="${categoryKey}"]`);
        if (container && categoriesData[categoryKey].length > 0) {
            renderCategoryPage(categoryKey, 1);
        }
    });
}

function renderCategoryPage(categoryKey, page) {
    const container = document.querySelector(`[data-category="${categoryKey}"]`);
    if (!container) return;

    currentPages[categoryKey] = page;
    const posts = categoriesData[categoryKey] || [];
    
    // Cắt mảng để lấy đúng 5 bài cho trang hiện tại
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = posts.slice(startIndex, endIndex);

    // 1. Render danh sách 5 bài viết
    container.innerHTML = itemsToDisplay.map(post => createPostCardHTML(post)).join('');

    // 2. Render nút phân trang ngay dưới container
    renderPaginationControls(categoryKey, container, posts.length, page);
}

function createPostCardHTML(post) {
    return `
        <article onclick="window.location.href='${post.link}'" 
                 class="bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-blue/50 transition-all duration-300 flex flex-row items-stretch min-h-[130px] sm:min-h-[200px] cursor-pointer group">
            
            <!-- Hình ảnh đại diện + Thẻ chủ đề -->
            <div class="w-[40%] sm:w-1/3 lg:w-2/5 relative shrink-0">
                <img src="${post.image}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${post.title}">
                <span class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-brand-blue text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-sm">${post.categoryLabel}</span>
            </div>

            <!-- Mảng chữ và nội dung -->
            <div class="w-[60%] sm:w-2/3 lg:w-3/5 p-3 sm:p-6 flex flex-col justify-between">
                <div>
                    <!-- Ngày đăng & Xem chi tiết -->
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] sm:text-sm text-brand-blue font-semibold">
                            <i class="fa-regular fa-calendar mr-1"></i> ${post.date}
                        </span>

                        <span class="text-brand-blue group-hover:text-brand-orange text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors">
                            Xem <span class="hidden sm:inline">chi tiết</span> <i class="fa-solid fa-arrow-right text-[8px] sm:text-[10px]"></i>
                        </span>
                    </div>
                    
                    <!-- Tiêu đề -->
                    <h3 class="font-bold text-[12px] leading-snug sm:line-clamp-2 sm:text-lg text-slate-900 mt-1 sm:mt-2 mb-1 sm:mb-2 group-hover:text-brand-blue transition-colors">
                        ${post.title}
                    </h3>

                    <!-- Đoạn mô tả tóm tắt -->
                    <p class="text-slate-600 text-[10px] sm:text-sm leading-relaxed sm:line-clamp-3 mt-1">
                        ${post.summary || ''}
                    </p>
                </div>
            </div>
        </article>
    `;
}

function renderPaginationControls(categoryKey, container, totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Tìm xem đã có thẻ phân trang bên dưới container chưa
    let paginationNav = container.parentNode.querySelector(`[data-pagination-for="${categoryKey}"]`);
    
    // Nếu chưa có, tự động tạo mới thẻ div chứa phân trang
    if (!paginationNav) {
        paginationNav = document.createElement('div');
        paginationNav.setAttribute('data-pagination-for', categoryKey);
        paginationNav.className = 'flex justify-center items-center gap-2 mt-6 sm:mt-8';
        container.parentNode.insertBefore(paginationNav, container.nextSibling);
    }

    // Nếu chỉ có 1 trang hoặc ít hơn 5 bài thì ẩn phân trang
    if (totalPages <= 1) {
        paginationNav.innerHTML = '';
        return;
    }

    // Tạo các nút bấm chuyển trang
    let buttonsHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        const btnClass = isActive
            ? 'bg-[#8c6239] text-white font-bold shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

        buttonsHTML += `
            <button 
                type="button"
                onclick="changeCategoryPage('${categoryKey}', ${i})" 
                class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${btnClass}">
                ${i}
            </button>
        `;
    }
    paginationNav.innerHTML = buttonsHTML;
}

// Hàm toàn cục hỗ trợ sự kiện onclick từ nút bấm
window.changeCategoryPage = function(categoryKey, page) {
    renderCategoryPage(categoryKey, page);
    
    // Cuộn nhẹ lên đầu section vừa chuyển trang
    const container = document.querySelector(`[data-category="${categoryKey}"]`);
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};