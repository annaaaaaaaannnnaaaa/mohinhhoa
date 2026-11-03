//  ADMIN – Orders (1.248 đơn mô phỏng + các đơn khách vừa mua thật)

const AD_ORD = (() => {
  let s = 20261019;
  const rnd = () => (s = (s*1664525+1013904223)>>>0)/4294967296, pick = a => a[Math.floor(rnd()*a.length)];
  const names = ['Nguyen Minh', 'Tran Huy', 'Le Thao', 'Pham Duc', 'Hoang Mai', 'Vu Khanh', 'Dang Phuc', 'Bui Ngoc', 'Do Trang', 'Ngo Bao', 'Duong Vy', 'Ly Tam', 'Phan Long', 'Truong Quyen', 'Dinh Khoa', 'Cao Yen'];
  const price = {'Arirang World Tour': [3500000, 2300000, 1600000, 1200000], 'Skynote': [3000000, 2300000, 1700000, 1200000], 'Sketch A Rose': [3500000, 2500000, 1800000, 1200000]};
  const cons = ['Arirang World Tour', 'Arirang World Tour', 'Skynote', 'Sketch A Rose'];
  const rows = AD_ORDERS_HEAD.map(r => ({id: r[0], name: r[1], concert: r[2], seats: r[3], amount: r[4], pay: r[5], status: r[6], date: r[7], day: r[7].startsWith('Oct 19') ? 19 : 18}));
  // Trạng thái còn lại: đúng số lượng theo thẻ thống kê (Paid 1.102 / Pending 96 / Failed 31 / Refunded 19)
  const st = [].concat(Array(1097).fill('Paid'), Array(95).fill('Pending'), Array(30).fill('Failed'), Array(18).fill('Refunded'));
  for (let i = st.length-1; i > 0; i--) {
    const j = Math.floor(rnd()*(i+1));
    [st[i], st[j]] = [st[j], st[i]]
  }
  const total = 5*1440+22*60+9, step = total/st.length;
  st.forEach((status, k) => {
    const i = k+8, n0 = 1042-i, n = n0 < 1 ? n0+2000 : n0, c = pick(cons), cnt = 1+Math.floor(rnd()*rnd()*3), row = 'ABCDEFGHJK'[Math.floor(rnd()*9)], num = 1+Math.floor(rnd()*12);
    const seats = Array.from({length: cnt}, (_, q) => row+(num+q)).join(', '), unit = pick(price[c]);
    const m = Math.max(0, total-Math.round(k*step)), pay = pick(['MoMo', 'ZaloPay', 'VNPay QR', 'Visa •• '+String(1000+Math.floor(rnd()*8999))]);
    rows.push({id: '#EN-'+String(n).padStart(4, '0'), name: pick(names), concert: c, seats, amount: unit*cnt, pay, status,
      date: 'Oct '+(13+Math.floor(m/1440))+' · '+pad(Math.floor(m%1440/60))+':'+pad(m%60), day: 13+Math.floor(m/1440)})
  });
  return rows
})();

// Đơn khách vừa mua trong luồng customer (lưu ở localStorage enc_orders)
function adRealOrders() {
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return orders().filter(o => o && Array.isArray(o.items) && cc(o.cid)).reverse().map(o => {
    const [hm, dmy] = String(o.paid || '').split(' · '), [d, m] = (dmy || '').split('/');
    return {id: '#'+o.id, name: o.name, concert: adShort[o.cid] || cc(o.cid).title, seats: o.items.map(x => x.row+x.n).join(', '), amount: o.sub+o.fee, pay: 'Demo payment', status: 'Paid',
      date: (mon[(+m || 1)-1])+' '+pad(+d || 1)+' · '+(hm || ''), day: +d || 19, real: true}
  })
}

// Danh sách đơn đã gộp + áp trạng thái admin đã sửa (refund…)
function adAllOrders() {
  const ov = adStore().ost || {};
  return adRealOrders().concat(AD_ORD).map(o => ov[o.id] ? {...o, status: ov[o.id]} : o)
}

// Phân trang dùng chung: ‹ 1 2 3 … 156 ›
function adPager(page, pages) {
  let it;
  if (pages <= 5) it = Array.from({length: pages}, (_, i) => i+1);
  else if (page <= 3) it = [1, 2, 3, '…', pages];
  else if (page >= pages-2) it = [1, '…', pages-2, pages-1, pages];
  else it = [1, '…', page-1, page, page+1, '…', pages];
  return `<div class="pg"><button type="button" data-p="${Math.max(1, page-1)}" aria-label="Previous page">‹</button>${it.map(x => x == '…' ? '<span class="el">…</span>' : `<button type="button" data-p="${x}" class="${x==page?'on':''}">${x}</button>`).join('')}<button type="button" data-p="${Math.min(pages, page+1)}" aria-label="Next page">›</button></div>`
}

const ADO = {q: '', concert: 'All concerts', status: 'All statuses', date: 'Oct 13 – Oct 19', page: 1};
const AD_PER = 8;

function adOrdFiltered() {
  const q = ADO.q.trim().toLowerCase();
  return adAllOrders().filter(o =>
    (ADO.concert == 'All concerts' || o.concert == ADO.concert) &&
    (ADO.status == 'All statuses' || o.status == ADO.status) &&
    (ADO.date == 'Oct 13 – Oct 19' || (ADO.date == 'Today · Oct 19' ? o.day == 19 : o.day >= 18)) &&
    (!q || (o.id+o.name+o.seats+o.concert).toLowerCase().includes(q)))
}

function adOrdTable() {
  const list = adOrdFiltered(), pages = Math.max(1, Math.ceil(list.length/AD_PER));
  if (ADO.page > pages) ADO.page = 1;
  const a = (ADO.page-1)*AD_PER, rows = list.slice(a, a+AD_PER);
  return `<div class="ad-t ord"><div class="th"><span>ORDER</span><span>CUSTOMER</span><span>CONCERT</span><span>SEATS</span><span>AMOUNT</span><span>PAYMENT</span><span>STATUS</span><span>DATE</span><span></span></div>
${rows.map(o => `<div class="tr"><b>${o.id}</b><span>${adEsc(o.name)}</span><span class="mu">${o.concert}</span><span>${o.seats}</span><b>${adMoney(o.amount)}</b><span class="mu">${o.pay}</span><span>${adPill(o.status)}</span><span class="mu">${o.date}</span><button type="button" class="dots" data-o="${o.id}" aria-label="Order actions">···</button></div>`).join('') || '<div class="empty">No orders match these filters.</div>'}
<div class="tf"><span class="mu">${rows.length ? `Showing ${a+1}–${a+rows.length} of ${adNum(list.length)} orders` : 'Showing 0 orders'}</span>${adPager(ADO.page, pages)}</div></div>`
}

function adpOrders() {
  const stat = (c, l, v, p) => `<div class="stat sm"><div class="l"><i class="dot" style="background:${c}"></i>${l}</div><div class="row"><b>${v}</b><span class="mu">${p}</span></div></div>`;
  const opt = (arr, cur) => arr.map(x => `<option ${x==cur?'selected':''}>${x}</option>`).join('');
  return `<div class="ad-top"><div><h1>Orders</h1><p class="sub">Track payments, seats and customer orders across all concerts.</p></div><div class="acts"><button type="button" class="ab" id="exp">Export CSV</button></div></div>
<div class="stats4">${stat('#2fd5a0', 'Paid', '1,102', '88.3% of orders')}${stat('#ffb95a', 'Pending', '96', '7.7% of orders')}${stat('#ff6b7d', 'Failed', '31', '2.5% of orders')}${stat('#9aa6bd', 'Refunded', '19', '1.5% of orders')}</div>
<div class="filters"><input class="ai" id="oq" placeholder="Search order ID, customer or seat…" value="${adEsc(ADO.q)}" style="width:347px"><select class="ai" id="oc" style="width:213px">${opt(['All concerts', 'Arirang World Tour', 'Skynote', 'Sketch A Rose'], ADO.concert)}</select>
<select class="ai" id="os" style="width:145px">${opt(['All statuses', 'Paid', 'Pending', 'Failed', 'Refunded'], ADO.status)}</select><select class="ai" id="od" style="width:193px">${opt(['Oct 13 – Oct 19', 'Oct 18 – Oct 19', 'Today · Oct 19'], ADO.date)}</select></div>
<div class="ad-card tbl" id="ot">${adOrdTable()}</div>`
}

function adOrdDetail(id) {
  const o = adAllOrders().find(x => x.id == id);
  if (!o) return;
  const flip = o.status == 'Paid' ? ['Refunded', 'Refund order', 'ab'] : o.status == 'Pending' ? ['Paid', 'Mark as paid', 'ab pu'] : null;
  const m = adModal('Order '+o.id, `<div class="kv"><span>Customer</span><b>${adEsc(o.name)}</b><span>Concert</span><b>${o.concert}</b><span>Seats</span><b>${o.seats}</b><span>Amount</span><b>${adMoney(o.amount)}</b><span>Payment</span><b>${o.pay}</b><span>Date</span><b>${o.date}</b><span>Status</span><b>${adPill(o.status)}</b></div>`,
    `${flip ? `<button type="button" class="${flip[2]}" id="mflip">${flip[1]}</button>` : ''}<button type="button" class="ab" id="mclose">Close</button>`);
  m.el.querySelector('#mclose').onclick = m.close;
  const f = m.el.querySelector('#mflip');
  if (f) f.onclick = () => {
    adSave({ost: {...(adStore().ost || {}), [o.id]: flip[0]}});
    m.close();
    toast('Order '+o.id+' set to '+flip[0]);
    $('#ot').innerHTML = adOrdTable();
    adBindOrdTable()
  }
}

function adBindOrdTable() {
  document.querySelectorAll('#ot [data-p]').forEach(b => b.onclick = () => {
    ADO.page = +b.dataset.p;
    $('#ot').innerHTML = adOrdTable();
    adBindOrdTable()
  });
  document.querySelectorAll('#ot [data-o]').forEach(b => b.onclick = () => adOrdDetail(b.dataset.o))
}

function adbOrders() {
  const upd = () => {
    ADO.page = 1;
    $('#ot').innerHTML = adOrdTable();
    adBindOrdTable()
  };
  $('#oq').oninput = e => {
    ADO.q = e.target.value;
    upd()
  };
  $('#oc').onchange = e => {
    ADO.concert = e.target.value;
    upd()
  };
  $('#os').onchange = e => {
    ADO.status = e.target.value;
    upd()
  };
  $('#od').onchange = e => {
    ADO.date = e.target.value;
    upd()
  };
  $('#exp').onclick = () => {
    const l = adOrdFiltered();
    adDownload('orders.csv', 'Order,Customer,Concert,Seats,Amount (VND),Payment,Status,Date\n'+l.map(o => [o.id, o.name, o.concert, '"'+o.seats+'"', o.amount, o.pay, o.status, o.date].join(',')).join('\n'));
    toast('Exported '+adNum(l.length)+' orders')
  };
  adBindOrdTable()
}
