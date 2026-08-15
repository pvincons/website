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
    posts.forEach(post => {
        
        // Dùng trực tiếp post.category để tìm container do tên đã đồng nhất
        const container = document.querySelector(`[data-category="${post.category}"]`);

        if (container) {
            let serviceHTML = '';

            if (post.category === 'pricing') {
                serviceHTML = `
                    <div class="p-5 bg-white rounded-xl border border-slate-200 flex justify-between items-stretch shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all gap-3">
                        <div class="min-w-0 flex-1 flex flex-col justify-center">
                            <h4 class="font-bold text-slate-900 text-sm sm:text-base">${post.title}</h4>
                            <p class="text-xs text-slate-500 mt-1"><i class="fa-solid ${post.icon} mr-1 text-brand-orange"></i>${post.summary}</p>
                        </div>
                        <div class="flex flex-col justify-between gap-2 shrink-0 w-32 sm:w-36">
                            <button onclick="openRequestModal('${post.title}', 'Tải báo giá')" class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap cursor-pointer"><i class="fa-solid fa-download"></i> Tải báo giá</button>
                            <a href="${post.link}" class="w-full text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-orange whitespace-nowrap"><i class="fa-solid fa-eye"></i> Xem quy trình</a>
                        </div>
                    </div>
                `;
            } else if (post.category === 'documents') {
                serviceHTML = `
                    <div class="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all gap-4">
                        <div class="min-w-0 flex-1">
                            <h4 class="font-bold text-slate-900 text-sm sm:text-base">${post.title}</h4>
                            <p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid ${post.icon} mr-1 text-brand-orange"></i>${post.summary}</p>
                        </div>
                        <div class="shrink-0">
                            <button onclick="openRequestModal('${post.title}', 'Tải tài liệu')" class="w-32 sm:w-36 text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 whitespace-nowrap cursor-pointer"><i class="fa-solid fa-download"></i> Tải tài liệu</button>
                        </div>
                    </div>
                `;
            }

            container.insertAdjacentHTML('beforeend', serviceHTML);
        }
    });
}