document.addEventListener('DOMContentLoaded', async () => {
    // Đường dẫn trỏ tới file JSON do admin tự sinh ra
    const jsonUrl = '/content/posts-projects.json';

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error('Không thể tải file JSON');
        
        // Parse dữ liệu
        const projects = await response.json();

        // Object để chứa các mảng dự án phân loại theo category
        const categories = {
            'dang-trien-khai': [],
            'da-hoan-thanh': [],
            'moi-nha-dau-tu': []
        };

        // Phân loại dự án vào từng nhóm
        projects.forEach(project => {
            if (categories[project.category]) {
                categories[project.category].push(project);
            }
        });

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
                    <div class="p-6">
                        ${p.location ? `<span class="text-xs text-brand-blue font-semibold uppercase tracking-wider"><i class="fa-solid fa-location-dot mr-1"></i> ${p.location}</span>` : ''}
                        <h3 class="font-bold text-base text-slate-900 mt-1 mb-3">${p.title}</h3>
                        <p class="text-slate-600 text-xs leading-relaxed text-justify mb-4">${p.summary}</p>
                    </div>
                </div>
                <div class="p-6 pt-0 flex justify-between items-center border-t border-slate-200/60 mt-2">
                    <span class="text-[11px] text-slate-500"><i class="fa-solid fa-ruler-combined mr-1"></i> Q.Mô: ${p.scale || 'Đang cập nhật'}</span>
                    <a href="${p.link || '#'}" class="text-brand-blue hover:text-brand-orange text-xs font-bold transition-colors">
                        Chi tiết &rarr;
                    </a>
                </div>
            </div>
        `;

        // 2. Template: ĐÃ HOÀN THÀNH (Bọc thẻ <a> toàn bộ card cho tiện click)
        const renderDaHoanThanh = (p) => `
            <a href="${p.link || '#'}" class="group block h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all">
                <div class="h-48 overflow-hidden relative">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-5">
                    <span class="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">${p.categoryLabel || 'Đã Bàn Giao'}</span>
                    <h4 class="font-bold text-slate-900 text-base mt-2 group-hover:text-brand-blue transition-colors">${p.title}</h4>
                    <p class="text-xs text-slate-500 mt-1">${p.summary}</p>
                </div>
            </a>
        `;

        // 3. Template: MỜI NHÀ ĐẦU TƯ
        const renderMoiNhaDauTu = (p) => `
            <a href="${p.link || '#'}" class="group block h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all">
                <div class="h-48 overflow-hidden relative">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-5">
                    <span class="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">${p.categoryLabel || 'Mời Hợp Tác'}</span>
                    <h4 class="font-bold text-slate-900 text-base mt-2 group-hover:text-brand-blue transition-colors">${p.title}</h4>
                    <p class="text-xs text-slate-500 mt-1">${p.summary}</p>
                </div>
            </a>
        `;

        /* =========================================
           TÌM VÙNG HIỂN THỊ VÀ BƠM DỮ LIỆU
        ========================================= */
        
        const containerTrienKhai = document.querySelector('#dang-trien-khai .grid');
        // Ghi đè toàn bộ card HTML cũ bằng dữ liệu JSON mới
        if (containerTrienKhai && categories['dang-trien-khai'].length > 0) {
            containerTrienKhai.innerHTML = categories['dang-trien-khai'].map(renderDangTrienKhai).join('');
        }

        const containerHoanThanh = document.querySelector('#da-hoan-thanh .grid');
        if (containerHoanThanh && categories['da-hoan-thanh'].length > 0) {
            containerHoanThanh.innerHTML = categories['da-hoan-thanh'].map(renderDaHoanThanh).join('');
        }

        const containerMoiDauTu = document.querySelector('#moi-nha-dau-tu .grid');
        if (containerMoiDauTu && categories['moi-nha-dau-tu'].length > 0) {
            containerMoiDauTu.innerHTML = categories['moi-nha-dau-tu'].map(renderMoiNhaDauTu).join('');
        }

    } catch (error) {
        console.error('Lỗi quá trình xử lý projects-loader.js:', error);
    }
});