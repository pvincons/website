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
    // 1. Khởi tạo Object rỗng để gom nhóm dữ liệu tự động theo category
    const categoriesData = {};

    // 2. Lặp 1 vòng để tự động phân loại data vào các mảng tương ứng dựa trên post.category
    posts.forEach(post => {
        if (!categoriesData[post.category]) {
            categoriesData[post.category] = [];
        }
        categoriesData[post.category].push(post);
    });

    // 3. Lặp qua các nhóm category đã có data và nạp vào DOM bằng map().join('')
    Object.keys(categoriesData).forEach(categoryKey => {
        const container = document.querySelector(`[data-category="${categoryKey}"]`);

        // Nếu tìm thấy container tương ứng trên HTML và có data cho category này
        if (container && categoriesData[categoryKey].length > 0) {
            
            // Ép toàn bộ cấu trúc mảng thành một chuỗi HTML duy nhất trước khi chèn
            container.innerHTML = categoriesData[categoryKey].map(post => {
                return `
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
                                
                                <!-- Tiêu đề -->
                                <h3 class="font-bold text-[14px] leading-snug sm:text-lg text-slate-900 mt-1 sm:mt-2 mb-1 sm:mb-2 line-clamp-2 group-hover:text-brand-blue uppercase transition-colors">
                                    ${post.title}
                                </h3>

                                <!-- Đoạn mô tả tóm tắt -->
                                <p class="text-slate-600 text-[12px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1">
                                    ${post.summary || ''}
                                </p>
                            </div>
                    </article>
                `;
            }).join(''); 
        }
    });
}