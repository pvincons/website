document.addEventListener('DOMContentLoaded', () => {
    fetch('content/posts-investment.json')
        .then(response => {
            if (!response.ok) throw new Error('Không thể tải dữ liệu Quan hệ đầu tư!');
            return response.json();
        })
        .then(posts => {
            // Sắp xếp bài viết theo ngày tháng giảm dần (dd/mm/yyyy)
            posts.sort((a, b) => {
                const [dayA, monthA, yearA] = a.date.split('/').map(Number);
                const [dayB, monthB, yearB] = b.date.split('/').map(Number);
                
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                
                return dateB - dateA;
            });
            
            renderInvestmentPosts(posts);
        })
        .catch(error => console.error('Lỗi nạp dữ liệu:', error));
});

function renderInvestmentPosts(posts) {
    // 1. Khởi tạo Object chứa mảng rỗng để gom nhóm dữ liệu
    const categoriesData = {
        'tai-chinh-cong-ty': [],
        'quan-he-co-dong': []
    };

    // 2. Lặp đúng 1 lần duy nhất để phân loại data vào Object
    posts.forEach(post => {
        if (categoriesData[post.category] !== undefined) {
            categoriesData[post.category].push(post);
        }
    });

    // 3. Render dữ liệu ra DOM bằng map().join('')
    Object.keys(categoriesData).forEach(categoryKey => {
        const container = document.querySelector(`[data-category="${categoryKey}"]`);
        
        if (container && categoriesData[categoryKey].length > 0) {
            // Kiểm tra category để render đúng CSS gốc của template
            const isFinance = categoryKey === 'tai-chinh-cong-ty';
            
            // Render toàn bộ mảng thành một chuỗi HTML duy nhất
            container.innerHTML = categoriesData[categoryKey].map(post => {
                // Thay đổi class linh hoạt dựa trên category để giữ 100% mẫu thiết kế của anh
                const containerClass = isFinance 
                    ? 'bg-white shadow-sm hover:shadow-md transition-all' 
                    : 'bg-slate-50 hover:border-brand-blue/40 transition-colors';
                const buttonBg = isFinance ? 'bg-slate-50' : 'bg-white';

                return `
                    <div class="p-5 ${containerClass} rounded-xl border border-slate-200 flex justify-between items-center hover:border-brand-blue/40 gap-3">
                        <div class="min-w-0 flex-1">
                            <h4 class="font-bold text-slate-900 text-sm sm:text-base">${post.title}</h4>
                            <p class="text-xs text-slate-500 mt-1"><i class="fa-regular fa-clock mr-1"></i>Đăng tải ngày: ${post.date}</p>
                        </div>
                        <a href="${post.link}" download class="text-brand-blue hover:text-brand-orange text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded ${buttonBg} border border-slate-200 hover:border-brand-orange whitespace-nowrap shrink-0">
                            <i class="fa-solid fa-download"></i> Tải về
                        </a>
                    </div>
                `;
            }).join(''); // Kết nối mảng thành một cục HTML duy nhất
        }
    });
}