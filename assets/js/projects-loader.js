const ITEMS_PER_PAGE = 6;
let categoriesData = {
    'dang-trien-khai': [],
    'da-hoan-thanh': [],
    'moi-nha-dau-tu': []
};
let currentPages = {};

// 1. Tối ưu parseDate: Parse trực tiếp thành tham số ngày/tháng/năm local timezone
function parseDate(dateStr) {
    if (!dateStr) return 0;
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month trong JS bắt đầu từ 0
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day).getTime() || 0;
        }
    }
    return new Date(dateStr).getTime() || 0;
}

// 2. Gộp 3 template trùng lặp thành 1 hàm duy nhất
const renderProjectCard = (p, defaultCategoryLabel) => `
<div class="group block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-0">
    <!-- Ảnh -->
    <div class="md:col-span-5 relative aspect-[4/3] md:aspect-auto overflow-hidden bg-slate-100">
        <img src="${p.image || ''}" alt="${p.title || ''}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <span class="absolute top-3 left-3 bg-brand-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            ${p.categoryLabel || defaultCategoryLabel}
        </span>
    </div>

    <!-- Nội dung -->
    <div class="md:col-span-7 p-5 flex flex-col justify-between space-y-4">
        <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span class="flex items-center gap-1"><i class="fa-solid fa-building mr-1"></i>Quy mô: ${p.scale || 'N/A'}</span>
                ${p.date ? `<span class="flex items-center gap-1"><i class="fa-regular fa-calendar-days mr-1"></i>${p.date}</span>` : ''}
            </div>
            <h3 class="font-bold text-base text-slate-900 leading-relaxed line-clamp-1 group-hover:text-brand-blue transition-colors uppercase">
                ${p.title || ''}
            </h3>
            <p class="text-slate-500 text-xs leading-relaxed line-clamp-2">
                ${p.summary || ''}
            </p>
        </div>

        <!-- Thông tin chi tiết + Nút bấm -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <div class="space-y-1">
                ${p.client ? `<p class="font-bold text-slate-800 uppercase truncate pt-2"><i class="fa-solid fa-user-tie text-brand-blue mr-1.5"></i>CĐT: ${p.client}</p>` : ''}
                ${p.location ? `<p class="text-slate-500 line-clamp-1"><i class="fa-solid fa-location-dot text-slate-400 mr-1.5"></i>${p.location}</p>` : ''}
            </div>
            <a href="${p.link || '/database/wait.html'}" class="text-brand-blue group-hover:text-brand-orange text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors">
                <i class="fa-solid fa-arrow-right"></i>
            </a>
        </div>
    </div>
</div>
`;

// Cấu hình danh mục gọn gàng
const categoryConfig = {
    'dang-trien-khai': { selector: '#dang-trien-khai .grid', defaultLabel: 'Đang triển khai' },
    'da-hoan-thanh': { selector: '#da-hoan-thanh .grid', defaultLabel: 'Đã hoàn thành' },
    'moi-nha-dau-tu': { selector: '#moi-nha-dau-tu .grid', defaultLabel: 'Mời nhà đầu tư' }
};

// Hàm khởi tạo ứng dụng
async function initProjectsLoader() {
    const jsonUrl = '/content/posts-projects.json';

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error('Không thể tải file JSON');

        const projects = await response.json();

        // Phân loại dự án vào từng nhóm
        projects.forEach(project => {
            if (categoriesData[project.category]) {
                categoriesData[project.category].push(project);
            }
        });

        // Sắp xếp các danh mục giảm dần theo ngày
        Object.keys(categoriesData).forEach(cat => {
            categoriesData[cat].sort((a, b) => parseDate(b.date) - parseDate(a.date));
        });

        // Hiển thị trang 1 cho cả 3 danh mục
        Object.keys(categoryConfig).forEach(categoryKey => {
            renderProjectPage(categoryKey, 1);
        });

    } catch (error) {
        console.error('Lỗi quá trình xử lý projects-loader.js:', error);
    }
}

// Bắt sự kiện load DOM an toàn
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectsLoader);
} else {
    initProjectsLoader();
}

function renderProjectPage(categoryKey, page) {
    const config = categoryConfig[categoryKey];
    if (!config) return;

    const container = document.querySelector(config.selector);
    if (!container) return;

    currentPages[categoryKey] = page;
    const projects = categoriesData[categoryKey] || [];

    // Xử lý khi không có dữ liệu
    if (projects.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-slate-400 py-8">Chưa có dự án nào trong mục này.</p>`;
        renderProjectPagination(categoryKey, container, 0, 1);
        return;
    }

    // Cắt mảng theo phân trang
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = projects.slice(startIndex, endIndex);

    // Render HTML
    container.innerHTML = itemsToDisplay.map(p => renderProjectCard(p, config.defaultLabel)).join('');

    // Render phân trang
    renderProjectPagination(categoryKey, container, projects.length, page);
}

function renderProjectPagination(categoryKey, container, totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    let paginationNav = container.parentNode.querySelector(`[data-pagination-for="${categoryKey}"]`);

    if (!paginationNav) {
        paginationNav = document.createElement('div');
        paginationNav.setAttribute('data-pagination-for', categoryKey);
        paginationNav.className = 'flex justify-center items-center gap-2 mt-6 sm:mt-8 w-full';
        container.parentNode.insertBefore(paginationNav, container.nextSibling);
    }

    if (totalPages <= 1) {
        paginationNav.innerHTML = '';
        return;
    }

    let buttonsHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        const btnClass = isActive
            ? 'bg-[#8c6239] text-white font-bold shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

        buttonsHTML += `
            <button 
                type="button"
                onclick="changeProjectPage('${categoryKey}', ${i})" 
                class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${btnClass}">
                ${i}
            </button>
        `;
    }
    paginationNav.innerHTML = buttonsHTML;
}

// Chuyển trang và cuộn nhẹ lên khu vực Section danh mục
window.changeProjectPage = function(categoryKey, page) {
    renderProjectPage(categoryKey, page);

    const section = document.getElementById(categoryKey);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};