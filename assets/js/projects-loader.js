document.addEventListener('DOMContentLoaded', async () => {
  // 1. Tìm container chứa danh sách dự án
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer) return;

  try {
    // 2. Lấy dữ liệu dự án (Lấy từ file JSON do Admin xuất ra hoặc LocalStorage)
    let projects = [];

    // Trường hợp 1: Fetch từ file JSON do CMS / Admin cập nhật
    const response = await fetch('/data/projects.json');
    if (response.ok) {
      projects = await response.json();
    } else {
      // Trường hợp 2: Fallback lấy từ LocalStorage nếu Admin lưu trực tiếp ở browser
      const localData = localStorage.getItem('pv_incons_projects');
      if (localData) projects = JSON.parse(localData);
    }

    if (!projects || projects.length === 0) {
      projectsContainer.innerHTML = '<p class="text-center text-slate-500 col-span-full">Chưa có dữ liệu dự án nào.</p>';
      return;
    }

    // 3. Render danh sách thẻ Card chuẩn HTML theo mẫu
    projectsContainer.innerHTML = projects.map(project => {
      // Tạo tiêu đề mail động theo tên dự án
      const mailSubject = encodeURIComponent(`Tư vấn dự án ${project.title || ''}`);
      const mailToUrl = `mailto:${project.email || 'workspace.pvi@gmail.com'}?subject=${mailSubject}`;

      return `
        <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <!-- Khung ảnh & Tag trạng thái -->
            <div class="h-52 overflow-hidden relative">
              <img src="${project.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop'}" 
                   alt="${project.title || 'Dự án'}" 
                   class="w-full h-full object-cover hover:scale-105 transition duration-500">
              
              ${project.status ? `
                <span class="absolute top-3 right-3 bg-brand-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow">
                  ${project.status}
                </span>
              ` : ''}
            </div>

            <!-- Nội dung chính -->
            <div class="p-6">
              ${project.location ? `
                <span class="text-xs text-brand-blue font-semibold uppercase tracking-wider">
                  <i class="fa-solid fa-location-dot mr-1"></i> ${project.location}
                </span>
              ` : ''}
              
              <h3 class="font-bold text-base text-slate-900 mt-1 mb-3">${project.title || 'Chưa đặt tên'}</h3>
              
              <p class="text-slate-600 text-xs leading-relaxed text-justify mb-4">
                ${project.description || ''}
              </p>
            </div>
          </div>

          <!-- Footer của Card -->
          <div class="p-6 pt-0 flex justify-between items-center border-t border-slate-200/60 mt-2">
            <span class="text-[11px] text-slate-500">
              <i class="fa-solid fa-ruler-combined mr-1"></i> Q.Mô: ${project.scale || 'N/A'}
            </span>
            <a href="${mailToUrl}" class="text-brand-blue hover:text-brand-orange text-xs font-bold transition-colors">
              Chi tiết &rarr;
            </a>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Lỗi khi tải danh sách dự án:', error);
    projectsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Không thể tải dữ liệu dự án.</p>';
  }
});