document.addEventListener('DOMContentLoaded', () => {
    fetch('content/posts-services.json')
        .then(response => {
            if (!response.ok) throw new Error('HTTP error!');
            return response.json();
        })
        .then(posts => {
            // Sắp xếp bài viết theo thứ tự id từ nhỏ đến lớn
            posts.sort((a, b) => a.id - b.id); 

            // Vẽ giao diện bài viết
            renderServices(posts);
        })
        .catch(error => console.error('Lỗi nạp dữ liệu services:', error));
});

function renderServices(posts) {
    // 1. Khởi tạo Object chứa mảng rỗng để gom nhóm dữ liệu theo category
    const categoriesData = {
        'pricing': [],
        'documents': []
    };

    // 2. Lặp 1 vòng duy nhất để phân loại data vào các mảng tương ứng
    posts.forEach(post => {
        if (categoriesData[post.category] !== undefined) {
            categoriesData[post.category].push(post);
        }
    });

    // 3. Lặp qua các nhóm category và nạp vào DOM bằng map().join('')
    Object.keys(categoriesData).forEach(categoryKey => {
        const container = document.querySelector(`[data-category="${categoryKey}"]`);
        
        if (container && categoriesData[categoryKey].length > 0) {
            
            // Render toàn bộ mảng thành một chuỗi HTML duy nhất
            container.innerHTML = categoriesData[categoryKey].map(post => {
                
                // Trả về giao diện riêng biệt cho từng category
                if (categoryKey === 'pricing') {
                    return `
                        <div class="p-5 bg-white rounded-xl border border-slate-200 flex justify-between items-stretch shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all gap-3">
                            <div class="min-w-0 flex-1 flex flex-col justify-center">
                                <h4 class="font-bold text-slate-900 text-sm sm:text-base">${post.title}</h4>
                                <p class="text-xs text-slate-500 mt-1"><i class="fa-solid ${post.icon} mr-1 text-brand-orange"></i>${post.summary}</p>
                            </div>
                            <div class="flex flex-col justify-between gap-2 shrink-0 w-32 sm:w-36">
                                <button onclick="openRequestModal('${post.title}', 'Tải báo giá', '${post.link}')" class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold 
                                flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap 
                                cursor-pointer"><i class="fa-solid fa-download"></i> Tải báo giá</button>
                                <a href="${post.eyelink}" target="_blank" rel="noopener noreferrer" 
                                class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 
                                border border-slate-200 hover:border-brand-orange whitespace-nowrap"><i class="fa-solid fa-eye"></i> Xem quy trình</a>
                            </div>
                        </div>
                    `;
                } else if (categoryKey === 'documents') {
                    return `
                        <div class="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all gap-4">
                            <div class="min-w-0 flex-1">
                                <h4 class="font-bold text-slate-900 text-sm sm:text-base">${post.title}</h4>
                                <p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid ${post.icon} mr-1 text-brand-orange"></i>${post.summary}</p>
                            </div>
                            <div class="shrink-0">
                                <a href="${post.link}" target="_blank" rel="noopener noreferrer" 
                                class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap"><i class="fa-solid fa-eye"></i> Xem tài liệu</a>
                            </div>
                        </div>
                    `;
                }
                return '';
            }).join(''); // Ép toàn bộ cấu trúc thành một chuỗi duy nhất trước khi đưa vào DOM
        }
    });
}