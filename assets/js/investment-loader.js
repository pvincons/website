const ITEMS_PER_PAGE = 10;
let categoriesData = {};
let filteredData = {};
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
            
            // Khởi tạo các section đầu tư, bộ lọc và phân trang
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

    // Tạo bản sao dữ liệu ban đầu cho danh sách lọc
    filteredData = {
        'tai-chinh-cong-ty': [...categoriesData['tai-chinh-cong-ty']],
        'quan-he-co-dong': [...categoriesData['quan-he-co-dong']]
    };

    // 2. Khởi tạo dropdown filter & lắng nghe sự kiện tìm kiếm/lọc
    ['tai-chinh-cong-ty', 'quan-he-co-dong'].forEach(categoryKey => {
        setupFilterOptions(categoryKey);
        setupEventListeners(categoryKey);
        renderInvestmentPage(categoryKey, 1);
    });
}

// Khởi tạo danh sách các tùy chọn cho thẻ Filter Select từ categoryLabel
function setupFilterOptions(categoryKey) {
    const filterSelect = document.getElementById(`filter-${categoryKey}`);
    if (!filterSelect) return;

    const posts = categoriesData[categoryKey] || [];
    const labels = new Set();
    
    posts.forEach(post => {
        if (post.categoryLabel) {
            labels.add(post.categoryLabel);
        }
    });

    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        filterSelect.appendChild(option);
    });
}

// Lắng nghe sự kiện tìm kiếm và chọn bộ lọc
function setupEventListeners(categoryKey) {
    const searchInput = document.getElementById(`search-${categoryKey}`);
    const filterSelect = document.getElementById(`filter-${categoryKey}`);

    const handleFilter = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedLabel = filterSelect ? filterSelect.value : 'ALL';

        filteredData[categoryKey] = (categoriesData[categoryKey] || []).filter(post => {
            const matchesSearch = !query || post.title.toLowerCase().includes(query);
            const matchesLabel = selectedLabel === 'ALL' || post.categoryLabel === selectedLabel;
            return matchesSearch && matchesLabel;
        });

        renderInvestmentPage(categoryKey, 1);
    };

    if (searchInput) searchInput.addEventListener('input', handleFilter);
    if (filterSelect) filterSelect.addEventListener('change', handleFilter);
}

function renderInvestmentPage(categoryKey, page) {
    const container = document.querySelector(`[data-category="${categoryKey}"]`);
    if (!container) return;

    currentPages[categoryKey] = page;
    const posts = filteredData[categoryKey] || [];
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 bg-white rounded-xl border border-slate-200 shadow-sm">
                <i class="fa-solid fa-folder-open text-slate-300 text-3xl mb-2"></i>
                <p class="text-slate-500 text-xs sm:text-sm font-medium">Không tìm thấy tài liệu phù hợp.</p>
            </div>
        `;
        renderPaginationControls(categoryKey, container, 0, 1);
        return;
    }

    // Cắt mảng để lấy đúng số bài cho trang hiện tại
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = posts.slice(startIndex, endIndex);

    // 1. Render danh sách bài viết trang hiện tại
    container.innerHTML = itemsToDisplay.map(post => createInvestmentPostHTML(post, categoryKey)).join('');

    // 2. Render thanh bấm chuyển trang ngay bên dưới container
    renderPaginationControls(categoryKey, container, posts.length, page);
}

/**
 * THIẾT KẾ CARD TÀI LIỆU "INVESTMENT" THEO YÊU CẦU MỚI
 */
function createInvestmentPostHTML(post, categoryKey) {
    const isFinance = categoryKey === 'tai-chinh-cong-ty';
    const containerBg = isFinance 
        ? 'bg-white hover:border-brand-blue/40 hover:shadow-md' 
        : 'bg-slate-50/70 hover:bg-white hover:border-brand-blue/40 hover:shadow-md';

    // Nhãn categoryLabel: chữ in thường, màu xám nhạt, kích thước nhỏ, bo tròn nhẹ
    const badgeHTML = post.categoryLabel 
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-normal lowercase bg-slate-100 text-slate-500 border border-slate-200/80 shrink-0">
            ${post.categoryLabel}
           </span>` 
        : '';

    return `
        <div class="group p-4 sm:p-5 ${containerBg} rounded-xl border border-slate-200 transition-all duration-200 flex flex-col gap-2">
            
            <!-- HÀNG 1: Đăng tải ngày (Canh trái) & categoryLabel (Canh phải) -->
            <div class="flex items-center justify-between w-full gap-2">
                <p class="text-xs text-slate-500 font-medium min-w-0 flex-1 truncate">
                    <i class="fa-regular fa-clock mr-1 text-slate-400"></i>Đăng tải ngày: ${post.date}
                </p>
                ${badgeHTML}
            </div>

            <!-- HÀNG 2: Tiêu đề (Canh trái) & Nút "Tải tài liệu" (Canh phải) -->
            <div class="flex items-center justify-between gap-3 pt-1">
                <h4 class="font-bold text-slate-900 text-sm sm:text-base leading-snug flex-1 min-w-0 group-hover:text-brand-blue transition-colors">
                    ${post.title}
                </h4>
                <a href="${post.link}" target="_blank" rel="noopener noreferrer" 
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-orange bg-slate-50 border border-slate-200 hover:border-brand-orange transition-colors whitespace-nowrap shrink-0">
                    <i class="fa-solid fa-download text-xs sm:text-sm"></i>
                    <span>Tải tài liệu</span>
                </a>
            </div>

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
        paginationNav.className = 'flex justify-center items-center gap-1.5 mt-5 sm:mt-7';
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
            ? 'bg-[#8c6239] text-white font-bold shadow-xs'
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