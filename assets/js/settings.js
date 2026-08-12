// Hàm tự động nạp thông tin chung từ settings.json
async function loadGlobalSettings() {
  try {
    const response = await fetch('/content/settings.json');
    const settings = await response.json();

    // 1. Đổ tên công ty
    const companyEl = document.getElementById('setting-company');
    if (companyEl) companyEl.innerText = settings.company_name;

    // 2. Đổ địa chỉ
    const addressEl = document.getElementById('setting-address');
    if (addressEl) addressEl.innerText = settings.contact.address;

    // 3. Đổ Số điện thoại & Link gọi điện
    const phoneEl = document.getElementById('setting-phone');
    if (phoneEl) phoneEl.innerText = settings.contact.phone_display;

    const phoneLinkEl = document.getElementById('setting-phone-link');
    if (phoneLinkEl) phoneLinkEl.href = `tel:${settings.contact.phone}`;

    // 4. Đổ Email
    const emailEl = document.getElementById('setting-email');
    if (emailEl) emailEl.innerText = settings.contact.email;

  } catch (error) {
    console.error("Lỗi khi tải file settings.json:", error);
  }
}

// Cho hàm chạy ngay khi trang web tải xong
document.addEventListener('DOMContentLoaded', loadGlobalSettings);