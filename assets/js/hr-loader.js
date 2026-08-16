document.addEventListener('DOMContentLoaded', async () => {
    const jsonUrl = '/content/posts-hr.json';
    const container = document.querySelector('#co-hoi-nghe-nghiep .grid');

    if (!container) return;

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error('Không thể nạp file JSON tuyển dụng');

        const data = await response.json();
        
        // Lọc các mục có category 'tuyen-dung'
        const recruitmentJobs = data.filter(job => job.category === 'tuyen-dung');

        if (recruitmentJobs.length === 0) return;

        // Render badge tương ứng theo loại hình công việc
        const renderBadge = (type) => {
            const isIntern = type.includes('Thực tập');
            const badgeClass = isIntern 
                ? 'bg-amber-50 text-amber-600 border-amber-100' 
                : 'bg-blue-50 text-brand-blue border-blue-100';

            return `<span class="px-3 py-1 ${badgeClass} text-xs font-semibold rounded-full border">${type}</span>`;
        };

        // Template thẻ vị trí tuyển dụng
        const renderJobCard = (job) => `
            <div class="bg-white p-6 rounded-2xl border border-slate-200 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        ${renderBadge(job.type)}
                        <span class="text-xs text-slate-400">${job.deadline}</span>
                    </div>
                    <h3 class="text-base sm:text-lg font-bold text-slate-900 mb-2 hover:text-brand-blue transition-colors">
                        ${job.title}
                    </h3>
                    <ul class="text-xs sm:text-sm text-slate-600 space-y-2 mb-4">
                        <li class="flex items-center gap-2">
                            <i class="fa-solid fa-location-dot text-brand-orange w-4"></i>
                            <span>${job.location}</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fa-solid fa-money-bill-wave text-brand-orange w-4"></i>
                            <span>${job.salary}</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fa-solid fa-check-circle text-brand-orange w-4"></i>
                            <span>${job.requirement}</span>
                        </li>
                    </ul>
                </div>
                <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-xs text-slate-500">${job.quantity}</span>
                    <a href="${job.applyLink || '#'}" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-blue hover:text-brand-orange transition-colors">
                        Ứng tuyển ngay <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </a>
                </div>
            </div>
        `;

        // Render đồng loạt vào DOM
        container.innerHTML = recruitmentJobs.map(renderJobCard).join('');

    } catch (error) {
        console.error('Lỗi quá trình xử lý hr-loader.js:', error);
    }
});