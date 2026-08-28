const ITEMS_PER_PAGE = 10; // Số tài liệu hiển thị trên mỗi trang (tùy chỉnh số lượng tại đây)
let categoriesData = {};
let currentPages = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('content/posts-investment.json')
        .then(response => {
            if (!response.ok) throw new Error('Không thể tải dữ liệu Quan hệ đầu tư!');
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
            
            // Khởi tạo các section đầu tư và phân trang
            initInvestmentSections(posts);
        })
        .catch(error => console.error('Lỗi nạp dữ liệu:', error));
});

function initInvestmentSections(posts) {
    categoriesData = {
        'tai-chinh-cong-ty': [],
        'quan-he-co-dong': []
    };

    // 1. Phân loại data vào Object theo category
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
            renderInvestmentPage(categoryKey, 1);
        }
    });
}

function renderInvestmentPage(categoryKey, page) {
    const container = document.querySelector(`[data-category="${categoryKey}"]`);
    if (!container) return;

    currentPages[categoryKey] = page;
    const posts = categoriesData[categoryKey] || [];
    
    // Cắt mảng để lấy đúng số bài cho trang hiện tại
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = posts.slice(startIndex, endIndex);

    // 1. Render danh sách bài viết trang hiện tại
    container.innerHTML = itemsToDisplay.map(post => createInvestmentPostHTML(post, categoryKey)).join('');

    // 2. Render thanh bấm chuyển trang ngay bên dưới container
    renderPaginationControls(categoryKey, container, posts.length, page);
}

function createInvestmentPostHTML(post, categoryKey) {
    const isFinance = categoryKey === 'tai-chinh-cong-ty';
    const containerClass = isFinance 
        ? 'bg-white shadow-sm hover:shadow-md transition-all' 
        : 'bg-slate-50 hover:border-brand-blue/40 transition-colors';
    const buttonBg = isFinance ? 'bg-slate-50' : 'bg-white';

    return `
        <div class="p-5 ${containerClass} rounded-xl border border-slate-200 flex justify-between items-center hover:border-brand-blue/40 gap-3">
            <div class="min-w-0 flex-1">
                <h4 class="font-bold text-slate-900 text-sm sm:text-base">${post.title}</h4>
                <p class="text-xs text-slate-500 mt-1"><i class="fa-regular fa-clock mr-1"></i>Đăng tải ngày: ${post.date}</p>
            </div>
            <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded ${buttonBg} border border-slate-200 hover:border-brand-orange whitespace-nowrap shrink-0">
                <i class="fa-solid fa-download"></i>Tải tài liệu
            </a>
        </div>
    `;
}

function renderPaginationControls(categoryKey, container, totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Tìm hoặc tạo mới element chứa nút phân trang
    let paginationNav = container.parentNode.querySelector(`[data-pagination-for="${categoryKey}"]`);
    
    if (!paginationNav) {
        paginationNav = document.createElement('div');
        paginationNav.setAttribute('data-pagination-for', categoryKey);
        paginationNav.className = 'flex justify-center items-center gap-2 mt-6 sm:mt-8';
        container.parentNode.insertBefore(paginationNav, container.nextSibling);
    }

    // Nếu chỉ có 1 trang hoặc không có dữ liệu thì ẩn phân trang
    if (totalPages <= 1) {
        paginationNav.innerHTML = '';
        return;
    }

    // Tạo danh sách nút số trang
    let buttonsHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        const btnClass = isActive
            ? 'bg-[#8c6239] text-white font-bold shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

        buttonsHTML += `
            <button 
                type="button"
                onclick="changeInvestmentCategoryPage('${categoryKey}', ${i})" 
                class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${btnClass}">
                ${i}
            </button>
        `;
    }
    paginationNav.innerHTML = buttonsHTML;
}

// Hàm toàn cục hỗ trợ sự kiện onclick từ nút phân trang
window.changeInvestmentCategoryPage = function(categoryKey, page) {
    renderInvestmentPage(categoryKey, page);
    
    // Cuộn mượt lên đầu danh mục sau khi chuyển trang
    const container = document.querySelector(`[data-category="${categoryKey}"]`);
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};