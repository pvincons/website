const ITEMS_PER_PAGE = 7; //Sửa số bài đăng (7) thành số .... mong muốn tại đây
let categoriesData = {
    'dang-trien-khai': [],
    'da-hoan-thanh': [],
    'moi-nha-dau-tu': []
};
let currentPages = {};

/* =========================================
   TEMPLATES RENDER CARD THEO TỪNG GIAO DIỆN
========================================= */

// 1. Template: ĐANG TRIỂN KHAI (Giữ nguyên cấu trúc có nút "Chi tiết")
const renderDangTrienKhai = (p) => `
    <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
            <div class="h-52 overflow-hidden relative">
                <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
                <span class="absolute top-3 right-3 bg-brand-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow">
                    ${p.categoryLabel || 'Đang Thi Công'}
                </span>
            </div>
            <div class="p-2 pb-1">
                <h3 class="font-bold text-base uppercase text-slate-900 mb-2">${p.title}</h3>
                <p class="text-slate-600 text-sm leading-relaxed text-justify mb-1">${p.summary}</p>
                ${p.location ? `<span class="text-xs text-brand-blue font-semibold uppercase tracking-wider"><i class="fa-solid fa-location-dot mr-1"></i> ${p.location}</span>` : ''}
            </div>
        </div>
        <div class="p-2 pt-2 flex justify-between items-center border-t border-slate-200/60 mt-2">
            <span class="text-xs text-slate-500 flex items-center"><i class="fa-solid fa-ruler-combined mr-1"></i> Quy mô: ${p.scale || 'Đang cập nhật'}</span>
            <a href="${p.link || '#'}" class="text-brand-blue hover:text-brand-orange text-xs font-bold transition-colors flex items-center h-full">
                Chi tiết &rarr;
            </a>
        </div>
    </div>
`;

// 2. Template: ĐÃ HOÀN THÀNH (Bọc thẻ <a> toàn bộ card cho tiện click)
const renderDaHoanThanh = (p) => `
    <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
            <div class="h-52 overflow-hidden relative">
                <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
                <span class="absolute top-3 right-3 bg-brand-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow">
                    ${p.categoryLabel || 'Đang Thi Công'}
                </span>
            </div>
            <div class="p-2 pb-1">
                <h3 class="font-bold text-base uppercase text-slate-900 mb-2">${p.title}</h3>
                <p class="text-slate-600 text-sm leading-relaxed text-justify mb-1">${p.summary}</p>
                ${p.location ? `<span class="text-xs text-brand-blue font-semibold uppercase tracking-wider"><i class="fa-solid fa-location-dot mr-1"></i> ${p.location}</span>` : ''}
            </div>
        </div>
        <div class="p-2 pt-2 flex justify-between items-center border-t border-slate-200/60 mt-2">
            <span class="text-xs text-slate-500 flex items-center"><i class="fa-solid fa-ruler-combined mr-1"></i> Quy mô: ${p.scale || 'Đang cập nhật'}</span>
            <a href="${p.link || '#'}" class="text-brand-blue hover:text-brand-orange text-xs font-bold transition-colors flex items-center h-full">
                Chi tiết &rarr;
            </a>
        </div>
    </div>
`;

// 3. Template: MỜI NHÀ ĐẦU TƯ
const renderMoiNhaDauTu = (p) => `
    <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
            <div class="h-52 overflow-hidden relative">
                <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
                <span class="absolute top-3 right-3 bg-brand-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow">
                    ${p.categoryLabel || 'Đang Thi Công'}
                </span>
            </div>
            <div class="p-2 pb-1">
                <h3 class="font-bold text-base uppercase text-slate-900 mb-2">${p.title}</h3>
                <p class="text-slate-600 text-sm leading-relaxed text-justify mb-1">${p.summary}</p>
                ${p.location ? `<span class="text-xs text-brand-blue font-semibold uppercase tracking-wider"><i class="fa-solid fa-location-dot mr-1"></i> ${p.location}</span>` : ''}
            </div>
        </div>
        <div class="p-2 pt-2 flex justify-between items-center border-t border-slate-200/60 mt-2">
            <span class="text-xs text-slate-500 flex items-center"><i class="fa-solid fa-ruler-combined mr-1"></i> Quy mô: ${p.scale || 'Đang cập nhật'}</span>
            <a href="${p.link || '#'}" class="text-brand-blue hover:text-brand-orange text-xs font-bold transition-colors flex items-center h-full">
                Chi tiết &rarr;
            </a>
        </div>
    </div>
`;

// Map ánh xạ cấu hình từng danh mục
const categoryConfig = {
    'dang-trien-khai': { selector: '#dang-trien-khai .grid', render: renderDangTrienKhai },
    'da-hoan-thanh': { selector: '#da-hoan-thanh .grid', render: renderDaHoanThanh },
    'moi-nha-dau-tu': { selector: '#moi-nha-dau-tu .grid', render: renderMoiNhaDauTu }
};

document.addEventListener('DOMContentLoaded', async () => {
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

        // Hiển thị trang 1 cho cả 3 danh mục
        Object.keys(categoryConfig).forEach(categoryKey => {
            renderProjectPage(categoryKey, 1);
        });

    } catch (error) {
        console.error('Lỗi quá trình xử lý projects-loader.js:', error);
    }
});

function renderProjectPage(categoryKey, page) {
    const config = categoryConfig[categoryKey];
    if (!config) return;

    const container = document.querySelector(config.selector);
    if (!container) return;

    currentPages[categoryKey] = page;
    const projects = categoriesData[categoryKey] || [];

    // Cắt mảng lấy đúng 7 dự án cho trang hiện tại
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = projects.slice(startIndex, endIndex);

    // Bơm HTML danh sách dự án
    container.innerHTML = itemsToDisplay.map(config.render).join('');

    // Bơm nút phân trang bên dưới
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

// Hàm toàn cục xử lý sự kiện click chuyển trang
window.changeProjectPage = function(categoryKey, page) {
    renderProjectPage(categoryKey, page);

    const config = categoryConfig[categoryKey];
    if (config) {
        const container = document.querySelector(config.selector);
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};