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
                    <div class="p-2 pb-1">
                        <h3 class="font-bold text-base uppercase text-slate-900 mb-2">${p.title}</h3>
                        <p class="text-slate-600 text-sm leading-relaxed text-justify mb-1">${p.summary}</p>
                        ${p.location ? `<span class="text-xs text-brand-blue font-semibold uppercase tracking-wider"><i class="fa-solid fa-location-dot mr-1"></i> ${p.location}</span>` : ''}
                    </div>
                </div>
                <div class="p-2 pt-2 flex justify-between items-center border-t border-slate-200/60 mt-2">
                    <span class="text-xs text-slate-500 flex items-center"><i class="fa-solid fa-ruler-combined mr-1"></i> Q.Mô: ${p.scale || 'Đang cập nhật'}</span>
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
                    <span class="text-xs text-slate-500 flex items-center"><i class="fa-solid fa-ruler-combined mr-1"></i> Q.Mô: ${p.scale || 'Đang cập nhật'}</span>
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
                    <span class="text-xs text-slate-500 flex items-center"><i class="fa-solid fa-ruler-combined mr-1"></i> Q.Mô: ${p.scale || 'Đang cập nhật'}</span>
                    <a href="${p.link || '#'}" class="text-brand-blue hover:text-brand-orange text-xs font-bold transition-colors flex items-center h-full">
                        Chi tiết &rarr;
                    </a>
                </div>
            </div>
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