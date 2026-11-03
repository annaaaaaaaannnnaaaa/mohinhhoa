//  ADMIN – khung chung

// ---------- Lưu trữ (localStorage, key enc_ad) ----------
const adStore = () => J(LS, 'enc_ad', {});
const adSave = patch => W(LS, 'enc_ad', {...adStore(), ...patch});
const adConcertList = () => adStore().concerts || JSON.parse(JSON.stringify(AD_CONCERTS));
const adSettings = () => ({...AD_SETTINGS0, ...(adStore().settings || {})});

// ---------- Định dạng ----------
const adNum = n => Math.round(n).toLocaleString('en-US');
const adMoney = n => adNum(n)+' ₫';
const adShort = {arirang: 'Arirang World Tour', skynote: 'Skynote', sketch: 'Sketch A Rose'};
const adPill = s => `<span class="pill p-${String(s).toLowerCase().replace(/\s/g, '')}">${s}</span>`;
const adInitials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const adEsc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const adSwitch = (id, on) => `<button type="button" class="sw ${on?'':'off'}" id="${id}" aria-pressed="${!!on}"><i></i></button>`;

// ---------- Điều hướng ----------
const AD_NAV = [['', 'Overview'], ['concerts', 'Concerts'], ['orders', 'Orders'], ['customers', 'Customers'], ['checkin', 'Check-in'], ['reports', 'Reports'], ['settings', 'Settings']];

function adHeader(sub) {
  const u = user(), checker = u.role == 'Ticket Checker';
  const nav = AD_NAV.filter(n => !checker || n[0] == 'checkin')
    .map(n => `<a class="${n[0]==sub?'on':''}" href="#/admin${n[0]?'/'+n[0]:''}">${n[1]}</a>`).join('');
  return `<header class="ad-h"><a class="logo" href="#/admin${checker?'/checkin':''}"><i>◈</i>ENCORE</a><nav class="ad-nav">${nav}</nav>
<span class="ad-who"><a class="acc" href="#" id="adwho">${checker?'CHECKER':'ADMIN'}</a><div class="ad-menu" id="admenu" hidden><small>${adEsc(u.email)}</small><a href="#/">Customer site</a><a href="#/logout">Log out</a></div></span></header>`;
}

// key: '' | concerts | concerts/new | orders | customers | checkin | reports | settings
const AD_PAGES = () => ({
  '': [adpOverview, adbOverview],
  'concerts': [adpConcerts, adbConcerts],
  'concerts/new': [adpNew, adbNew],
  'orders': [adpOrders, adbOrders],
  'customers': [adpCustomers, adbCustomers],
  'checkin': [adpCheckin, adbCheckin],
  'reports': [adpReports, adbReports],
  'settings': [adpSettings, adbSettings],
});

function adKey() {
  const h = location.hash.slice(2).split('/');
  return (h[1] || '') + (h[2] ? '/'+h[2] : '');
}

function adRoute(sub, id, keepScroll) {
  const u = user();
  if (!u) {
    SS.setItem('enc_next', location.hash);
    return location.hash = '#/login'
  }
  if (u.role == 'Customer') {
    toast(t('perm'));
    return location.hash = '#/'
  }
  const key = (sub || '') + (id ? '/'+id : ''), pages = AD_PAGES();
  if (u.role == 'Ticket Checker' && key != 'checkin') return location.hash = '#/admin/checkin';
  if (!pages[key]) return location.hash = '#/admin';
  const y = window.scrollY;
  $('#app').innerHTML = adHeader(sub || '')+`<main class="ad">${pages[key][0]()}</main>`;
  window.scrollTo(0, keepScroll ? y : 0);
  const who = $('#adwho');
  who.onclick = e => {
    e.preventDefault();
    $('#admenu').hidden = !$('#admenu').hidden
  };
  pages[key][1]();
}

// Vẽ lại trang admin hiện tại (giữ vị trí cuộn)
const adRefresh = () => {
  const h = location.hash.slice(2).split('/');
  adRoute(h[1] || '', h[2], true)
};

// ---------- Modal ----------
function adModal(title, body, foot = '') {
  const m = document.createElement('div');
  m.className = 'ad-modal';
  m.innerHTML = `<div class="box"><div class="mh"><h3>${title}</h3><button type="button" class="x" aria-label="Close">✕</button></div><div class="mb">${body}</div>${foot?`<div class="mf">${foot}</div>`:''}</div>`;
  const close = () => {
    m.remove();
    document.removeEventListener('keydown', esc)
  };
  const esc = e => e.key == 'Escape' && close();
  document.addEventListener('keydown', esc);
  m.onclick = e => e.target == m && close();
  m.querySelector('.x').onclick = close;
  document.body.appendChild(m);
  return {el: m, close}
}

// ---------- Tải file (CSV…) ----------
function adDownload(name, text, type = 'text/csv') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff'+text], {type: type+';charset=utf-8'}));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

// ---------- Biểu đồ SVG ----------
function adSmooth(p) {
  const f = n => n.toFixed(1);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < p.length-1; i++) {
    const p0 = p[i-1] || p[i], p1 = p[i], p2 = p[i+1], p3 = p[i+2] || p2;
    d += `C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

// Bước chia trục "đẹp"
function adStep(max, n) {
  const raw = max/n, pow = Math.pow(10, Math.floor(Math.log10(raw))), m = raw/pow;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10)*pow
}

// Biểu đồ vùng (Overview – Revenue overview)
function adArea(labels, vals) {
  const W_ = 800, H_ = 176, L = 56, R = 26, T = 12, B = 30, mx = Math.max(...vals), step = adStep(mx, 3.5), top = Math.ceil(mx*1.02/step)*step, tick = Math.floor(mx/step)*step;
  const x = i => L+(W_-L-R)*i/(vals.length-1), y = v => T+(H_-T-B)*(1-v/top);
  const pts = vals.map((v, i) => [x(i), y(v)]), line = adSmooth(pts), last = pts[pts.length-1];
  let g = '';
  for (let v = 0; v <= tick; v += step) g += `<line x1="${L}" x2="${W_-R}" y1="${y(v)}" y2="${y(v)}" stroke="#222d48" stroke-dasharray="3 4"/><text x="${L-12}" y="${y(v)+4}" text-anchor="end" class="ax">${v ? v+'M' : 0}</text>`;
  const every = Math.ceil(labels.length/7);
  return `<svg viewBox="0 0 ${W_} ${H_}" class="chart" role="img" aria-label="Revenue chart"><defs><linearGradient id="adg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7553f7" stop-opacity=".38"/><stop offset="1" stop-color="#7553f7" stop-opacity="0"/></linearGradient></defs>${g}
<path d="${line}L${last[0]} ${y(0)}L${L} ${y(0)}Z" fill="url(#adg)"/><path d="${line}" fill="none" stroke="#7553f7" stroke-width="3" stroke-linecap="round"/>
<line x1="${last[0]}" x2="${last[0]}" y1="${last[1]}" y2="${y(0)}" stroke="#7553f7" stroke-dasharray="3 4"/>
${pts.map((p, i) => i == pts.length-1 ? `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#fff" stroke="#7553f7" stroke-width="3"/>` : `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#131a2d" stroke="#7553f7" stroke-width="2"/>`).join('')}
${labels.map((l, i) => (i % every == 0 || i == labels.length-1) ? `<text x="${x(i)}" y="${H_-8}" text-anchor="middle" class="ax">${l}</text>` : '').join('')}</svg>`
}

// Biểu đồ cột + đường (Reports – Revenue and tickets sold)
function adCombo(labels, tickets, rev) {
  const W_ = 800, H_ = 230, L = 40, R = 20, T = 40, B = 30, step = adStep(Math.max(...tickets), 3), top = Math.ceil(Math.max(...tickets)*1.12/step)*step;
  const cw = (W_-L-R)/tickets.length, y = v => T+(H_-T-B)*(1-v/top), mr = Math.max(...rev), yr = v => T+(H_-T-B)*(1-(v/mr)*.62-.04);
  let g = '';
  for (let v = 0; v <= top; v += step) g += `<line x1="${L}" x2="${W_-R}" y1="${y(v)}" y2="${y(v)}" stroke="#222d48" stroke-dasharray="3 4"/><text x="${L-10}" y="${y(v)+4}" text-anchor="end" class="ax">${adNum(v)}</text>`;
  const pts = rev.map((v, i) => [L+cw*i+cw/2, yr(v)]), every = Math.ceil(labels.length/7);
  return `<svg viewBox="0 0 ${W_} ${H_}" class="chart" role="img" aria-label="Revenue and tickets chart">${g}
${tickets.map((v, i) => `<rect x="${L+cw*i+cw/2-19}" y="${y(v)}" width="38" height="${y(0)-y(v)}" rx="6" fill="#4a3b99"/>`).join('')}
<path d="${adSmooth(pts)}" fill="none" stroke="#ff5c77" stroke-width="3" stroke-linecap="round"/>
${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#131a2d" stroke="#ff5c77" stroke-width="2.5"/>`).join('')}
${labels.map((l, i) => (i % every == 0 || i == labels.length-1) ? `<text x="${L+cw*i+cw/2}" y="${H_-8}" text-anchor="middle" class="ax">${l}</text>` : '').join('')}</svg>`
}

// Vòng tròn "Sales by channel" (4 cung, mỗi cung chia dải màu như thiết kế)
function adDonut(total) {
  const cx = 100, cy = 100, r1 = 62, r2 = 94, cols = [AD_COL.pu, AD_COL.tl, AD_COL.pk, AD_COL.tl, AD_COL.pu];
  const pt = (r, a) => [cx+r*Math.cos(a*Math.PI/180), cy+r*Math.sin(a*Math.PI/180)].map(n => n.toFixed(1)).join(' ');
  const arc = (a, b) => `M${pt(r2, a)}A${r2} ${r2} 0 0 1 ${pt(r2, b)}L${pt(r1, b)}A${r1} ${r1} 0 0 0 ${pt(r1, a)}Z`;
  let s = '';
  for (let q = 0; q < 4; q++) {
    const a0 = q*90-90+11, span = 68, w = span/cols.length;
    cols.forEach((c, i) => s += `<path d="${arc(a0+w*i, a0+w*(i+1))}" fill="${c}"/>`)
  }
  return `<svg viewBox="0 0 200 200" class="donut" role="img" aria-label="Sales by channel">${s}<text x="100" y="102" text-anchor="middle" class="dn">${adNum(total)}</text><text x="100" y="120" text-anchor="middle" class="ds">tickets</text></svg>`
}
