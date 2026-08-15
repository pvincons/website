/**
 * SERVICES LOADER - PV INCONS
 * Tự động tải và đồng bộ dữ liệu Bảng giá & Tài liệu mẫu từ Admin/LocalStorage
 */

// Dữ liệu mặc định ban đầu (Khôi phục nếu không có dữ liệu admin)
const DEFAULT_SERVICES_DATA = {
    pricing: [
        {
            id: "price-1",
            title: "Thiết kế Kiến trúc, Kết cấu & M&E (Mô phỏng 3D BIM)",
            price: "150.000 - 550.000 VNĐ/m²",
            processUrl: "#dich-vu-chinh"
        },
        {
            id: "price-2",
            title: "Thi công xây dựng phần thô & Trọn gói công trình",
            price: "6.000.000 - 11.000.000 VNĐ/m²",
            processUrl: "#dich-vu-chinh"
        },
        {
            id: "price-3",
            title: "Tư vấn báo cáo tiền khả thi & Bảng tính dòng tiền dự án",
            price: "Từ 15.000.000 VNĐ / Hồ sơ",
            processUrl: "#dich-vu-chinh"
        },
        {
            id: "price-4",
            title: "Trích đo hiện trạng VN-2000, Xin phép XD & Hoàn công",
            price: "Từ 5.000.000 - 35.000.000 VNĐ / Trọn gói",
            processUrl: "#dich-vu-chinh"
        }
    ],
    documents: [
        { id: "doc-1", title: "1. Hợp đồng thiết kế", desc: "Mẫu hợp đồng tư vấn & thiết kế chuẩn quy trình BIM/VDC", icon: "fa-file-contract" },
        { id: "doc-2", title: "2. Hợp đồng thi công", desc: "Mẫu hợp đồng thi công phần thô & trọn gói công trình", icon: "fa-file-contract" },
        { id: "doc-3", title: "3. Hợp đồng dịch vụ pháp lý", desc: "Mẫu hợp đồng trích đo, xin phép xây dựng & hoàn công", icon: "fa-file-contract" },
        { id: "doc-4", title: "4. Văn bản thỏa thuận thực hiện dịch vụ", desc: "Mẫu thỏa thuận ghi nhớ & nguyên tắc hợp tác ban đầu", icon: "fa-file-signature" },
        { id: "doc-5", title: "5. Biên bản giám sát tác giả", desc: "Mẫu ghi nhận kiểm tra thực địa của đơn vị tư vấn thiết kế", icon: "fa-clipboard-check" },
        { id: "doc-6", title: "6. Phiếu RFI (Request For Information)", desc: "Mẫu phiếu yêu cầu làm rõ thông tin thiết kế & kỹ thuật", icon: "fa-circle-question" },
        { id: "doc-7", title: "7. Phiếu RFA (Request For Approval)", desc: "Mẫu phiếu trình duyệt vật tư, thiết bị & giải pháp thi công", icon: "fa-file-circle-check" },
        { id: "doc-8", title: "8. Biên bản nghiệm thu công việc", desc: "Mẫu biên bản nghiệm thu chuyển bước thi công & giai đoạn công trình", icon: "fa-list-check" },
        { id: "doc-9", title: "9. Hợp đồng khoán việc", desc: "Mẫu hợp đồng giao khoán nhân công & hạng mục chuyên biệt", icon: "fa-file-contract" },
        { id: "doc-10", title: "10. Phiếu giao nhận hồ sơ", desc: "Mẫu biên bản bàn giao bản vẽ, hồ sơ pháp lý & chứng từ công trình", icon: "fa-box-archive" }
    ]
};

// Hàm hỗ trợ XSS & tránh lỗi dấu ngoặc đơn trong chuỗi JS
function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Lấy dữ liệu từ LocalStorage hoặc gán mặc định
function getServicesData() {
    try {
        const localData = localStorage.getItem('pvincons_services_data');
        if (localData) {
            return JSON.parse(localData);
        }
    } catch (e) {
        console.warn('Lỗi đọc dữ liệu LocalStorage:', e);
    }
    return DEFAULT_SERVICES_DATA;
}

// Render danh sách Bảng giá
function renderPricingList(pricingList) {
    const container = document.getElementById('pricing-list-container');
    if (!container) return;

    if (!pricingList || pricingList.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-500 py-4 text-sm">Chưa có thông tin bảng giá.</p>`;
        return;
    }

    container.innerHTML = pricingList.map(item => `
        <div class="p-5 bg-white rounded-xl border border-slate-200 flex justify-between items-stretch shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all gap-3">
            <div class="min-w-0 flex-1 flex flex-col justify-center">
                <h4 class="font-bold text-slate-900 text-sm sm:text-base">${item.title}</h4>
                <p class="text-xs text-slate-500 mt-1">
                    <i class="fa-solid fa-tag mr-1 text-brand-orange"></i>Đơn giá: ${item.price}
                </p>
            </div>
            <div class="flex flex-col justify-between gap-2 shrink-0 w-32 sm:w-36">
                <button onclick="openRequestModal('${escapeAttr(item.title)}', 'Tải báo giá')"
                    class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap cursor-pointer">
                    <i class="fa-solid fa-download"></i> Tải báo giá
                </button>
                <a href="${item.processUrl || '#dich-vu-chinh'}"
                    class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap">
                    <i class="fa-solid fa-eye"></i> Xem quy trình
                </a>
            </div>
        </div>
    `).join('');
}

// Render danh sách Tài liệu mẫu
function renderDocsList(docsList) {
    const container = document.getElementById('docs-list-container');
    if (!container) return;

    if (!docsList || docsList.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-500 py-4 text-sm">Chưa có thông tin tài liệu mẫu.</p>`;
        return;
    }

    container.innerHTML = docsList.map(item => `
        <div class="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all gap-4">
            <div class="min-w-0 flex-1">
                <h4 class="font-bold text-slate-900 text-sm sm:text-base">${item.title}</h4>
                <p class="text-xs text-slate-500 mt-0.5">
                    <i class="fa-solid ${item.icon || 'fa-file-contract'} mr-1 text-brand-orange"></i>${item.desc}
                </p>
            </div>
            <div class="shrink-0">
                <button onclick="openRequestModal('${escapeAttr(item.title)}', 'Tải tài liệu')"
                    class="w-32 sm:w-36 text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 whitespace-nowrap cursor-pointer">
                    <i class="fa-solid fa-download"></i> Tải tài liệu
                </button>
            </div>
        </div>
    `).join('');
}

// Khởi chạy khi DOM hoàn tất
document.addEventListener('DOMContentLoaded', () => {
    const data = getServicesData();
    renderPricingList(data.pricing);
    renderDocsList(data.documents);
});