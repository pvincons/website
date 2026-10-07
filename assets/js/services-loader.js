let servicesData = {
    pricing: [],
    documents: []
};
let filteredDocuments = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('content/posts-services.json')
        .then(response => {
            if (!response.ok) throw new Error('Không thể tải dữ liệu dịch vụ!');
            return response.json();
        })
        .then(posts => {
            // Sắp xếp bài viết theo id tăng dần
            posts.sort((a, b) => a.id - b.id);
            initServicesData(posts);
        })
        .catch(error => console.error('Lỗi nạp dữ liệu services:', error));
});

function initServicesData(posts) {
    servicesData = {
        pricing: [],
        documents: []
    };

    // Phân loại data vào Object
    posts.forEach(post => {
        if (servicesData[post.category] !== undefined) {
            servicesData[post.category].push(post);
        }
    });

    filteredDocuments = [...servicesData.documents];

    // 1. Render khu vực Bảng giá
    renderPricingSection();

    // 2. Khởi tạo Filter theo categoryLabel & Lắng nghe sự kiện tìm kiếm
    setupDocumentCategoryFilters();
    setupDocumentEventListeners();

    // 3. Render khu vực Tài liệu
    renderDocumentsSection();
}

/**
 * RENDER KHU VỰC BẢNG GIÁ
 */
function renderPricingSection() {
    const container = document.querySelector('[data-category="pricing"]');
    if (!container || servicesData.pricing.length === 0) return;

    container.innerHTML = servicesData.pricing.map(post => `
        <div class="p-5 bg-white rounded-xl border border-slate-200 flex justify-between items-stretch shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all gap-3">
            <div class="min-w-0 flex-1 flex flex-col justify-center">
                <h4 class="font-bold text-slate-900 text-sm sm:text-base">${post.title}</h4>
                <p class="text-xs text-slate-500 mt-1"><i class="fa-solid ${post.icon} mr-1 text-brand-orange"></i>${post.summary}</p>
            </div>
            <div class="flex flex-col justify-between gap-2 shrink-0 w-32 sm:w-36">
                <button onclick="openRequestModal('${post.title}', 'Nhận báo giá')" class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap cursor-pointer"><i class="fa-solid fa-download"></i> Tải báo giá</button>
                <a href="${post.eyelink}" target="_blank" rel="noopener noreferrer" 
                class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap"><i class="fa-solid fa-eye"></i> Xem quy trình</a>
            </div>
        </div>
    `).join('');
}

/**
 * TẠO BỘ LỌC DROPDOWN THEO CATEGORYLABEL DÀNH CHO DOCUMENTS
 */
function setupDocumentCategoryFilters() {
    const filterSelect = document.getElementById('filter-documents');
    if (!filterSelect) return;

    const labels = new Set();
    servicesData.documents.forEach(post => {
        if (post.categoryLabel) {
            labels.add(post.categoryLabel);
        }
    });

    filterSelect.innerHTML = '<option value="ALL">Tất cả danh mục</option>';

    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        filterSelect.appendChild(option);
    });
}

/**
 * LẮNG NGHE SỰ KIỆN TÌM KIẾM VÀ LỌC THEO CATEGORYLABEL & TỪ KHÓA
 */
function setupDocumentEventListeners() {
    const searchInput = document.getElementById('search-documents');
    const filterSelect = document.getElementById('filter-documents');

    const handleFilter = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCategory = filterSelect ? filterSelect.value : 'ALL';

        filteredDocuments = servicesData.documents.filter(post => {
            const matchesSearch = !query || 
                (post.title && post.title.toLowerCase().includes(query)) ||
                (post.summary && post.summary.toLowerCase().includes(query));
            const matchesCategory = selectedCategory === 'ALL' || post.categoryLabel === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderDocumentsSection();
    };

    if (searchInput) searchInput.addEventListener('input', handleFilter);
    if (filterSelect) filterSelect.addEventListener('change', handleFilter);
}

/**
 * RENDER DANH SÁCH TÀI LIỆU (DOCUMENTS)
 */
function renderDocumentsSection() {
    const container = document.querySelector('[data-category="documents"]');
    if (!container) return;

    if (filteredDocuments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                <i class="fa-solid fa-folder-open text-slate-300 text-3xl mb-2"></i>
                <p class="text-slate-500 text-xs sm:text-sm font-medium">Không tìm thấy tài liệu phù hợp.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredDocuments.map(post => createDocumentPostHTML(post)).join('');
}

/**
 * THIẾT KẾ CARD TÀI LIỆU "DOCUMENT" CHUẨN ĐẸP TƯƠNG TỰ TAB INVESTMENT:
 * - HÀNG 1: MÔ TẢ VÀ ICON BAN ĐẦU (CANH TRÁI) | CATEGORYLABEL (CANH PHẢI)
 * - HÀNG 2: TIÊU ĐỀ (CANH TRÁI) | NÚT "XEM TÀI LIỆU" (CANH PHẢI)
 */
function createDocumentPostHTML(post) {
    // Nhãn categoryLabel canh phải
    const badgeHTML = post.categoryLabel 
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-brand-blue border border-blue-100/80 shrink-0">
            ${post.categoryLabel}
           </span>` 
        : '';

    return `
        <div class="group p-3 sm:p-3.5 bg-white hover:border-brand-blue/40 hover:shadow-md rounded-xl border border-slate-200/90 transition-all duration-200 flex flex-col gap-2">
            
            <!-- HÀNG 1: Mô tả & Icon giữ nguyên 100% (Canh trái) & categoryLabel (Canh phải) -->
            <div class="flex items-center justify-between w-full gap-2">
                <p class="text-[11px] sm:text-xs text-slate-500 font-medium min-w-0 truncate">
                    <i class="fa-solid ${post.icon} mr-1 text-brand-orange"></i>${post.summary || ''}
                </p>
                ${badgeHTML}
            </div>

            <!-- HÀNG 2: Tiêu đề (Canh trái) & Nút "Xem tài liệu" (Góc phải) -->
            <div class="flex items-center justify-between gap-3 pt-0.5">
                <h4 class="font-bold text-slate-900 text-xs sm:text-sm leading-snug flex-1 min-w-0 group-hover:text-brand-blue transition-colors">
                    ${post.title}
                </h4>
                <a href="${post.link}" target="_blank" rel="noopener noreferrer" 
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-blue hover:text-white bg-slate-100/90 hover:bg-brand-blue border border-slate-200/80 hover:border-brand-blue transition-all duration-200 whitespace-nowrap shrink-0 shadow-2xs">
                    <i class="fa-solid fa-eye text-[11px]"></i>
                    <span>Xem tài liệu</span>
                </a>
            </div>

        </div>
    `;
}