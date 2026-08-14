document.addEventListener('DOMContentLoaded', () => {
    fetch('content/posts-news.json')
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file posts-news.json');
            return response.json();
        })
        .then(posts => {
            // --- CHÉP DÒNG CODE SẮP XẾP VÀO ĐÂY ---
            posts.sort((a, b) => b.id - a.id); 

            // Sau khi sắp xếp xong mới vẽ ra giao diện
            renderNewsPosts(posts);
        })
        .catch(error => console.error('Lỗi nạp tin tức:', error));
});

function renderNewsPosts(posts) {
    posts.forEach(post => {
        const container = document.querySelector(`[data-category="${post.category}"]`);

        if (container) {
            const articleHTML = `
                <article class="bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-blue/50 transition-all duration-300 flex flex-row items-stretch min-h-[130px] sm:min-h-[200px]">
                    <div class="w-[40%] sm:w-1/3 lg:w-2/5 relative shrink-0">
                        <img src="${post.image}" class="absolute inset-0 w-full h-full object-cover hover:scale-105 transition duration-500" alt="${post.title}">
                        <span class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-brand-blue text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-sm">${post.categoryLabel}</span>
                    </div>
                    <div class="w-[60%] sm:w-2/3 lg:w-3/5 p-3 sm:p-6 flex flex-col justify-between">
                        <div>
                            <span class="text-[10px] sm:text-xs text-brand-blue font-semibold"><i class="fa-regular fa-calendar mr-1"></i> ${post.date}</span>
                            <h3 class="font-bold text-[13px] leading-snug sm:text-lg text-slate-900 mt-1 sm:mt-2 mb-1.5 sm:mb-3 line-clamp-3 sm:line-clamp-2 hover:text-brand-blue transition-colors">
                                ${post.title}
                            </h3>
                            <p class="hidden sm:-webkit-box text-justify text-slate-600 text-sm leading-relaxed line-clamp-3">
                                ${post.summary}
                            </p>
                        </div>
                        <div class="mt-2 sm:mt-5 flex justify-end">
                            <a href="${post.link}" class="text-brand-blue hover:text-brand-orange text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors py-1.5 px-2.5 sm:py-2 sm:px-4 rounded bg-slate-50 border border-slate-200 hover:border-brand-orange shadow-sm">
                                Xem <span class="hidden sm:inline">chi tiết</span> <i class="fa-solid fa-arrow-right text-[8px] sm:text-[10px]"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `;
            container.insertAdjacentHTML('beforeend', articleHTML);
        }
    });
}