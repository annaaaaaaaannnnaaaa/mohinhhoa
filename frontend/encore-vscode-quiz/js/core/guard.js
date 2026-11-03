const DATA_VER = '2';   

// Dữ liệu đơn/ghế lưu từ bản code cũ (phí sai, cấu trúc cũ) sẽ được dọn một lần
if (LS.getItem('enc_ver') != DATA_VER) {
  ['enc_orders', 'enc_sold'].forEach(k => LS.removeItem(k));
  SS.removeItem('enc_sel');
  LS.setItem('enc_ver', DATA_VER)
}

// Ghế đang chọn mà đã hết 10 phút (hoặc thiếu giờ giữ) -> xử lý rõ ràng thay vì bị bật ngược im lặng
function holdGuard() {
  const S = sel();
  if (!S.items || !S.items.length) return;
  if (!S.end) {
    S.end = Date.now()+600000;
    W(SS, 'enc_sel', S)
  } else if (S.end <= Date.now()) {
    W(SS, 'enc_sel', {cid: S.cid, items: [], end: 0});
    toast('Hold expired – seats released. Please select your seats again.')
  }
}

// Xoá toàn bộ dữ liệu demo (đơn hàng, ghế đã bán, vé, cấu hình admin) rồi về trang chủ
function resetDemo() {
  ['enc_orders', 'enc_sold', 'enc_ad', 'enc_users'].forEach(k => LS.removeItem(k));
  SS.clear();
  location.hash = '#/';
  location.reload()
}

// Nếu một trang bị lỗi khi vẽ, hiện thông báo thay vì đứng yên ở trang trước
function errPage(e) {
  return `<div class="wrap" style="max-width:640px;margin:60px auto;text-align:center"><h1 style="font-size:32px">Something went wrong</h1><p class="sub">This page could not be displayed. If it keeps happening, reset the demo data and try again.</p>
<p class="sub" style="font-size:12px">${String(e && e.message || e).replace(/</g, '&lt;')}</p><button class="btn" onclick="resetDemo()">Reset demo data</button> <a class="btn ghost" href="#/" style="display:inline-block">Home</a></div>`
}
