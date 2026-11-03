//  DỮ LIỆU DEMO CHO TRANG ADMIN  (số liệu lấy đúng theo PDF thiết kế)
//  Muốn đổi số liệu hiển thị → sửa.

const AD_COL = {pu: '#7553f7', pk: '#ff5c77', tl: '#2eccb0', or: '#f5a623'};

// Danh sách concert
const AD_CONCERTS = [
  {id: 'c1', key: 'arirang', title: 'Arirang World Tour 2026', venue: 'Bangkok Arena · Bangkok', date: '18 Nov 2026', time: '19:30', sold: 820, total: 1000, status: 'On sale', g: ['#8b5cf6', '#c026d3'],
    cats: [['VIP', AD_COL.pu, 3500000, 500], ['CAT 1', AD_COL.pk, 2300000, 1000], ['CAT 2', AD_COL.tl, 1600000, 1000], ['CAT 3', AD_COL.or, 1200000, 1000]], seatSel: true, queue: true},
  {id: 'c2', key: 'skynote', title: 'SkyNote · Quoc Thien', venue: 'Hanoi Opera House · Hanoi', date: '24 Nov 2026', time: '20:00', sold: 340, total: 600, status: 'On sale', g: ['#ff5c77', '#ff7a1a'],
    cats: [['VIP', AD_COL.pu, 3000000, 100], ['CAT 1', AD_COL.pk, 2300000, 200], ['CAT 2', AD_COL.tl, 1700000, 150], ['CAT 3', AD_COL.or, 1200000, 150]], seatSel: true, queue: true},
  {id: 'c3', key: 'sketch', title: 'Sketch A Rose · Ha Anh Tuan', venue: 'Phu Tho Indoor Stadium · HCMC', date: '12 Dec 2026', time: '19:00', sold: 0, total: 2400, status: 'Upcoming', g: ['#f5a623', '#ff5c77'],
    cats: [['VIP', AD_COL.pu, 3500000, 300], ['CAT 1', AD_COL.pk, 2500000, 700], ['CAT 2', AD_COL.tl, 1800000, 700], ['CAT 3', AD_COL.or, 1200000, 700]], seatSel: true, queue: true},
  {id: 'c4', key: '', title: 'Winter Fan Meeting 2026', venue: 'Grand Theater · Seoul', date: '20 Dec 2026', time: '18:00', sold: 0, total: 900, status: 'Draft', g: ['#2eccb0', '#3b82f6'],
    cats: [['VIP', AD_COL.pu, 2800000, 100], ['CAT 1', AD_COL.pk, 1900000, 300], ['CAT 2', AD_COL.tl, 1400000, 300], ['CAT 3', AD_COL.or, 900000, 200]], seatSel: true, queue: false},
  {id: 'c5', key: '', title: 'Summer Sonic Night', venue: 'Thong Nhat Stadium · HCMC', date: '02 Aug 2026', time: '19:00', sold: 5200, total: 5200, status: 'Ended', g: ['#8b5cf6', '#c026d3'],
    cats: [['VIP', AD_COL.pu, 2500000, 400], ['CAT 1', AD_COL.pk, 1800000, 1200], ['CAT 2', AD_COL.tl, 1200000, 1800], ['CAT 3', AD_COL.or, 800000, 1800]], seatSel: false, queue: true},
  {id: 'c6', key: '', title: 'Acoustic Evenings', venue: 'Hanoi Opera House · Hanoi', date: '05 Dec 2026', time: '20:00', sold: 120, total: 400, status: 'On sale', g: ['#3b82f6', '#8b5cf6'],
    cats: [['VIP', AD_COL.pu, 1800000, 60], ['CAT 1', AD_COL.pk, 1200000, 140], ['CAT 2', AD_COL.tl, 900000, 120], ['CAT 3', AD_COL.or, 600000, 80]], seatSel: true, queue: false},
  {id: 'c7', key: '', title: 'Lunar Beats 2027', venue: 'Quan Khu 7 Stadium · HCMC', date: '06 Feb 2027', time: '19:00', sold: 0, total: 3000, status: 'Upcoming', g: ['#f5a623', '#ef4444'],
    cats: [['VIP', AD_COL.pu, 3200000, 300], ['CAT 1', AD_COL.pk, 2200000, 900], ['CAT 2', AD_COL.tl, 1500000, 900], ['CAT 3', AD_COL.or, 900000, 900]], seatSel: true, queue: true},
  {id: 'c8', key: '', title: 'Indie Rock Night', venue: 'Hoa Binh Theater · HCMC', date: '15 Jun 2026', time: '20:00', sold: 800, total: 800, status: 'Ended', g: ['#2eccb0', '#8b5cf6'],
    cats: [['VIP', AD_COL.pu, 1500000, 100], ['CAT 1', AD_COL.pk, 1100000, 250], ['CAT 2', AD_COL.tl, 800000, 250], ['CAT 3', AD_COL.or, 500000, 200]], seatSel: false, queue: false},
];

// ---- Khách hàng (7 dòng như PDF) ----
const AD_CUSTOMERS = [
  {n: 'Nguyen An', e: 'an.nguyen@mail.com', o: 6, t: 14, spent: '38.4M', last: 'Oct 19', st: 'VIP', col: AD_COL.pu, phone: '+84 912 345 678', since: 'Mar 2025',
    recent: [['#EN-1042', 'Arirang World Tour · C6, C7', 4600000, 'Paid'], ['#EN-0987', 'Skynote · A2', 1800000, 'Paid'], ['#EN-0911', 'Sketch A Rose · B4, B5', 3600000, 'Refunded']]},
  {n: 'Tran Linh', e: 'linh.tran@mail.com', o: 3, t: 7, spent: '12.6M', last: 'Oct 19', st: 'Active', col: AD_COL.pk, phone: '+84 938 221 460', since: 'Jun 2025',
    recent: [['#EN-1040', 'Skynote · B9', 1800000, 'Pending'], ['#EN-0953', 'Arirang World Tour · D3, D4', 4600000, 'Paid'], ['#EN-0874', 'Sketch A Rose · C1', 2500000, 'Paid']]},
  {n: 'Le Minh', e: 'minh.le@mail.com', o: 1, t: 2, spent: '2.4M', last: 'Oct 19', st: 'New', col: AD_COL.tl, phone: '+84 977 118 305', since: 'Oct 2026',
    recent: [['#EN-1039', 'Sketch A Rose · D4', 1200000, 'Paid']]},
  {n: 'Pham Hanh', e: 'hanh.pham@mail.com', o: 4, t: 9, spent: '21.1M', last: 'Oct 18', st: 'Active', col: AD_COL.or, phone: '+84 903 774 592', since: 'Jan 2026',
    recent: [['#EN-1038', 'Skynote · A5, A6', 3600000, 'Failed'], ['#EN-0966', 'Arirang World Tour · F2, F3', 4600000, 'Paid'], ['#EN-0902', 'Skynote · C7', 1800000, 'Paid']]},
  {n: 'Do Quang', e: 'quang.do@mail.com', o: 8, t: 19, spent: '52.7M', last: 'Oct 18', st: 'VIP', col: AD_COL.pu, phone: '+84 989 650 213', since: 'Nov 2024',
    recent: [['#EN-1037', 'Arirang World Tour · F10', 2300000, 'Paid'], ['#EN-1001', 'Sketch A Rose · A1, A2', 7000000, 'Paid'], ['#EN-0944', 'Skynote · VIP A4', 3000000, 'Paid']]},
  {n: 'Vu Lan', e: 'lan.vu@mail.com', o: 2, t: 3, spent: '6.9M', last: 'Oct 17', st: 'Active', col: AD_COL.pk, phone: '+84 916 402 887', since: 'Aug 2025',
    recent: [['#EN-1036', 'Arirang World Tour · H3, H4', 2800000, 'Refunded'], ['#EN-0931', 'Skynote · B2', 1700000, 'Paid']]},
  {n: 'Hoang Nam', e: 'nam.hoang@mail.com', o: 1, t: 1, spent: '2.3M', last: 'Oct 15', st: 'Blocked', col: '#6b7691', phone: '+84 905 339 741', since: 'Oct 2026',
    recent: [['#EN-1035', 'Sketch A Rose · B1, B2, B3', 5400000, 'Paid']]},
];

// ---- 8 đơn hàng đầu tiên (đúng như PDF) ----
const AD_ORDERS_HEAD = [
  ['#EN-1042', 'Demo Customer', 'Arirang World Tour', 'C6, C7', 4600000, 'Visa •• 4821', 'Paid', 'Oct 19 · 14:02'],
  ['#EN-1041', 'Nguyen An', 'Arirang World Tour', 'A2', 3500000, 'MoMo', 'Paid', 'Oct 19 · 13:41'],
  ['#EN-1040', 'Tran Linh', 'Skynote', 'B9', 1800000, 'ZaloPay', 'Pending', 'Oct 19 · 13:15'],
  ['#EN-1039', 'Le Minh', 'Sketch A Rose', 'D4', 1200000, 'VNPay QR', 'Paid', 'Oct 19 · 12:58'],
  ['#EN-1038', 'Pham Hanh', 'Skynote', 'A5, A6', 3600000, 'Visa •• 1190', 'Failed', 'Oct 19 · 12:30'],
  ['#EN-1037', 'Do Quang', 'Arirang World Tour', 'F10', 2300000, 'MoMo', 'Paid', 'Oct 19 · 11:47'],
  ['#EN-1036', 'Vu Lan', 'Arirang World Tour', 'H3, H4', 2800000, 'ZaloPay', 'Refunded', 'Oct 19 · 10:22'],
  ['#EN-1035', 'Hoang Nam', 'Sketch A Rose', 'B1, B2, B3', 5400000, 'Visa •• 7733', 'Paid', 'Oct 18 · 22:09'],
];

// ---- Doanh thu theo thời gian (triệu VND) ----
const AD_REV = {
  '7D':  {labels: ['Oct 13', 'Oct 14', 'Oct 15', 'Oct 16', 'Oct 17', 'Oct 18', 'Oct 19'], v: [150, 192, 174, 262, 244, 322, 294], sub: 'Last 7 days · Simulated payments'},
  '30D': {labels: ['Sep 20', 'Sep 23', 'Sep 26', 'Sep 29', 'Oct 02', 'Oct 05', 'Oct 08', 'Oct 11', 'Oct 14', 'Oct 17', 'Oct 19'], v: [90, 130, 110, 160, 140, 190, 170, 230, 210, 290, 294], sub: 'Last 30 days · Simulated payments'},
  'All': {labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], v: [40, 85, 120, 150, 210, 180, 260, 294], sub: 'All time · Simulated payments'},
};

// ---- Vé mẫu để thử soát vé (ngoài các vé khách mua thật trong localStorage) ----
const AD_TICKETS = {
  'TKT-8F2A-1045': {holder: 'Nguyen An', key: 'arirang', seat: 'CAT 1 · Row C · Seat 7'},
  'TKT-8F2A-1044': {holder: 'Tran Linh', key: 'arirang', seat: 'CAT 1 · Row C · Seat 6'},
  'TKT-9C1B-0227': {holder: 'Le Minh', key: 'arirang', seat: 'CAT 2 · Row F · Seat 3'},
  'TKT-7D3E-0561': {holder: 'Pham Hanh', key: 'arirang', seat: 'VIP · Row A · Seat 8'},
};

// ---- Trạng thái soát vé ban đầu của từng concert ----
const AD_CK0 = {
  arirang: {entered: 392, total: 1200, valid: 380, dup: 9, inv: 3, done: [], log: [
    ['TKT-8F2A-1045', 'Nguyen An', '14:32:08', 'Valid'], ['TKT-8F2A-1044', 'Tran Linh', '14:31:41', 'Valid'],
    ['TKT-8F2A-1044', 'Tran Linh', '14:31:12', 'Duplicate'], ['TKT-9C1B-0227', 'Le Minh', '14:30:55', 'Valid'],
    ['TKT-0000-0000', 'Unknown', '14:30:20', 'Invalid'], ['TKT-7D3E-0561', 'Pham Hanh', '14:29:47', 'Valid']]},
  skynote: {entered: 0, total: 600, valid: 0, dup: 0, inv: 0, done: [], log: []},
  sketch:  {entered: 0, total: 2400, valid: 0, dup: 0, inv: 0, done: [], log: []},
};

const AD_SETTINGS0 = {org: 'Encore Entertainment', email: 'support@encore.vn', tz: '(GMT+7) Hanoi, Bangkok', cur: 'VND (₫)', queue: true, hold: '10 min', max: '6', qr: true,
  pay: {visa: true, momo: true, zalo: true, vnpay: true}, notif: {order: true, refund: true, daily: false}};
// =====================================================================
//  NỐI API: lấy danh sách concert từ MySQL (Flask) thay cho dữ liệu demo
//  Dán vào CUỐI file này. Nếu API lỗi thì vẫn dùng AD_CONCERTS ở trên.
// =====================================================================

// ConcertID trong database -> key mà frontend dùng (check-in, ảnh, màu...)
const AD_API_KEY = {CON01: 'arirang', CON02: 'skynote', CON03: 'sketch'};

// Status trong database -> status hiển thị ở frontend
const AD_API_STATUS = {OnSale: 'On sale', Upcoming: 'Upcoming', Draft: 'Draft', Ended: 'Ended', Completed: 'Ended'};

const AD_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-11-22 19:00:00" -> {date: '22 Nov 2026', time: '19:00'}
function adSplitDateTime(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(String(s || ''));
  if (!m) return {date: String(s || ''), time: ''};
  return {date: `${m[3]} ${AD_MON[+m[2] - 1]} ${m[1]}`, time: `${m[4]}:${m[5]}`};
}

// 1 dòng từ API -> 1 object concert đúng cấu trúc frontend
function adFromApi(c) {
  const key = AD_API_KEY[c.ConcertID] || '';
  const tpl = AD_CONCERTS.find(x => key && x.key === key) || {};   // mượn màu, hạng vé, sold/total từ bản demo
  const dt = adSplitDateTime(c.StartTime);
  return {
    ...tpl,
    id: c.ConcertID,
    key,
    title: c.ConcertName,
    venue: c.Venue,
    date: dt.date,
    time: dt.time,
    status: AD_API_STATUS[c.Status] || c.Status,
    sold: tpl.sold ?? 0,
    total: tpl.total ?? 0,
    g: tpl.g || ['#8b5cf6', '#c026d3'],
    cats: tpl.cats || [],
    seatSel: tpl.seatSel ?? true,
    queue: tpl.queue ?? false
  };
}

// Gọi API, lưu vào cache (localStorage) để adConcertList() đọc được
async function adLoadConcerts() {
  try {
    const res = await fetch('/api/admin/concerts');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Dữ liệu API không hợp lệ');
    adSave({concerts: json.data.map(adFromApi)});
    // Đang ở trang admin thì vẽ lại để thấy dữ liệu mới
    if (location.hash.startsWith('#/admin')) window.dispatchEvent(new HashChangeEvent('hashchange'));
  } catch (e) {
    console.warn('Không tải được concert từ API, dùng dữ liệu demo.', e);
  }
}

adLoadConcerts();