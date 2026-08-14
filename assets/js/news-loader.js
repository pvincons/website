document.addEventListener('DOMContentLoaded', () => {
    fetch('content/posts-news.json')
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file posts-news.json');
            return response.json();
        })
        .then(posts => {
            // Sắp xếp bài viết theo ID giảm dần
            posts.sort((a, b) => b.id - a.id); 

            // Vẽ giao diện bài viết
            renderNewsPosts(posts);
        })
        .catch(error => console.error('Lỗi nạp tin tức:', error));
});

function renderNewsPosts(posts) {
    posts.forEach(post => {
        const container = document.querySelector(`[data-category="${post.category}"]`);

        if (container) {
            const articleHTML = `
                <article onclick="window.location.href='${post.link}'" 
                         class="bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-blue/50 transition-all duration-300 flex flex-row items-stretch min-h-[130px] sm:min-h-[200px] cursor-pointer group">
                    
                    <!-- Hình ảnh đại diện + Thẻ chủ đề -->
                    <div class="w-[40%] sm:w-1/3 lg:w-2/5 relative shrink-0">
                        <img src="${post.image}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${post.title}">
                        <span class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-brand-blue text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-sm">${post.categoryLabel}</span>
                    </div>

                    <!-- Mảng chữ và nội dung -->
                    <div class="w-[60%] sm:w-2/3 lg:w-3/5 p-3 sm:p-6 flex flex-col justify-between">
                        <div>
                            <!-- Ngày đăng -->
                            <span class="text-[10px] sm:text-xs text-brand-blue font-semibold"><i class="fa-regular fa-calendar mr-1"></i> ${post.date}</span>
                            
                            <!-- Tiêu đề (Đã thêm text-justify) -->
                            <h3 class="font-bold text-[13px] leading-snug sm:text-lg text-slate-900 mt-1 sm:mt-2 mb-1 sm:mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors text-justify">
                                ${post.title}
                            </h3>

                            <!-- Đoạn mô tả tóm tắt (Đã thêm text-justify & hiện chữ nhỏ phía dưới) -->
                            <p class="text-slate-600 text-[11px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 text-justify mt-1">
                                ${post.summary || ''}
                            </p>
                        </div>

                        <!-- Nút xem chi tiết -->
                        <div class="mt-2 sm:mt-4 flex justify-end">
                            <span class="text-brand-blue group-hover:text-brand-orange text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors py-1.5 px-2.5 sm:py-2 sm:px-4 rounded bg-slate-50 border border-slate-200 group-hover:border-brand-orange shadow-sm">
                                Xem <span class="hidden sm:inline">chi tiết</span> <i class="fa-solid fa-arrow-right text-[8px] sm:text-[10px]"></i>
                            </span>
                        </div>
                    </div>
                </article>
            `;
            container.insertAdjacentHTML('beforeend', articleHTML);
        }
    });
}