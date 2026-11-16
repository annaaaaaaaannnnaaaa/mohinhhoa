//  ADMIN – Orders (1.248 đơn mô phỏng + các đơn khách vừa mua thật)


// Danh sách đơn hàng lấy từ database
let AD_ORDERS_REAL = [];
let AD_ORDERS_LOADED = false;
let AD_ORDERS_ERROR = '';

function adOrderDate(value) {
  if (!value) return '';

  const m = String(value).match(
    /(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/
  );

  if (!m) return String(value);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return `${months[Number(m[2]) - 1]} ${m[3]} · ${m[4]}:${m[5]}`;
}

function adAllOrders() {
  const ov = adStore().ost || {};

  return AD_ORDERS_REAL.map(o => ({
    id: '#' + o.BillID,
    name: o.CustomerName || o.CustomerID || 'Unknown',
    concert: o.ConcertName || 'Unknown concert',
    seats: `${o.TotalTickets || 0} tickets`,
    amount: Number(o.TotalAmount || 0),
    pay: o.PaymentMethod || 'N/A',
    status: ({
      Success: 'Paid',
      Pending: 'Pending',
      Failed: 'Failed'
    })[o.PaymentStatus] || o.PaymentStatus || 'Unknown',
    date: adOrderDate(o.BillDate),
    day: Number(String(o.BillDate || '').slice(8, 10)),
    real: true
  })).map(o =>
    ov[o.id] ? { ...o, status: ov[o.id] } : o
  );
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
    (ADO.date == 'All dates' || o.date.startsWith(ADO.date)) &&
    (!q || (o.id + o.name + o.seats + o.concert).toLowerCase().includes(q))
  );
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
  const stat = (c, l, v, p) =>
    `<div class="stat sm">
      <div class="l"><i class="dot" style="background:${c}"></i>${l}</div>
      <div class="row"><b>${v}</b><span class="mu">${p}</span></div>
    </div>`;

  const list = adAllOrders();
  const total = list.length;

  const count = status => list.filter(o => o.status === status).length;
  const percent = n => total ? (n / total * 100).toFixed(1) + '% of orders' : '0% of orders';

  const concerts = [...new Set(AD_ORDERS_REAL.map(o => o.ConcertName).filter(Boolean))];

  const opt = (arr, cur) =>
    arr.map(x => `<option ${x == cur ? 'selected' : ''}>${adEsc(x)}</option>`).join('');

  return `<div class="ad-top">
    <div>
      <h1>Orders</h1>
      <p class="sub">Track payments, seats and customer orders across all concerts.</p>
    </div>
    <div class="acts">
      <button type="button" class="ab" id="exp">Export CSV</button>
    </div>
  </div>

  <div class="stats4" id="ostats">
    ${stat('#2fd5a0', 'Paid', adNum(count('Paid')), percent(count('Paid')))}
    ${stat('#ffb95a', 'Pending', adNum(count('Pending')), percent(count('Pending')))}
    ${stat('#ff6b7d', 'Failed', adNum(count('Failed')), percent(count('Failed')))}
    ${stat('#9aa6bd', 'Refunded', adNum(count('Refunded')), percent(count('Refunded')))}
  </div>

  <div class="filters">
    <input class="ai" id="oq"
      placeholder="Search order ID, customer or seat…"
      value="${adEsc(ADO.q)}" style="width:347px">

    <select class="ai" id="oc" style="width:213px">
      ${opt(['All concerts', ...concerts], ADO.concert)}
    </select>

    <select class="ai" id="os" style="width:145px">
      ${opt(['All statuses', 'Paid', 'Pending', 'Failed', 'Refunded'], ADO.status)}
    </select>

    <select class="ai" id="od" style="width:193px">
      ${opt(['All dates'], ADO.date)}
    </select>
  </div>

  <div class="ad-card tbl" id="ot">
    ${AD_ORDERS_ERROR
      ? `<div class="empty">Unable to load orders: ${adEsc(AD_ORDERS_ERROR)}</div>`
      : !AD_ORDERS_LOADED
        ? '<div class="empty">Loading orders...</div>'
        : adOrdTable()}
  </div>`;
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


async function adbOrders() {
  const upd = () => {
    ADO.page = 1;
    $('#ot').innerHTML = adOrdTable();
    adBindOrdTable();
  };

  $('#oq').oninput = e => {
    ADO.q = e.target.value;
    upd();
  };

  $('#oc').onchange = e => {
    ADO.concert = e.target.value;
    upd();
  };

  $('#os').onchange = e => {
    ADO.status = e.target.value;
    upd();
  };

  $('#od').onchange = e => {
    ADO.date = e.target.value;
    upd();
  };

  $('#exp').onclick = () => {
    const l = adOrdFiltered();

    adDownload(
      'orders.csv',
      'Order,Customer,Concert,Seats,Amount (VND),Payment,Status,Date\n' +
      l.map(o => [
        o.id,
        o.name,
        o.concert,
        '"' + o.seats + '"',
        o.amount,
        o.pay,
        o.status,
        o.date
      ].join(',')).join('\n')
    );

    toast('Exported ' + adNum(l.length) + ' orders');
  };

  try {
    const token = localStorage.getItem('enc_token');

    if (!token) {
      throw new Error('Admin token not found. Please log in again.');
    }

    const res = await fetch('/api/admin/orders', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Cannot load orders');
    }

    AD_ORDERS_REAL = Array.isArray(json.data) ? json.data : [];
    AD_ORDERS_LOADED = true;
    AD_ORDERS_ERROR = '';

    const concerts = [...new Set(
      AD_ORDERS_REAL.map(o => o.ConcertName).filter(Boolean)
    )];

    if (ADO.concert !== 'All concerts' && !concerts.includes(ADO.concert)) {
      ADO.concert = 'All concerts';
    }

    $('#ostats').innerHTML = (() => {
      const list = adAllOrders();
      const total = list.length;

      const count = status => list.filter(o => o.status === status).length;
      const percent = n => total
        ? (n / total * 100).toFixed(1) + '% of orders'
        : '0% of orders';

      const stat = (c, l, v, p) =>
        `<div class="stat sm">
          <div class="l"><i class="dot" style="background:${c}"></i>${l}</div>
          <div class="row"><b>${v}</b><span class="mu">${p}</span></div>
        </div>`;

      return stat('#2fd5a0', 'Paid', adNum(count('Paid')), percent(count('Paid'))) +
        stat('#ffb95a', 'Pending', adNum(count('Pending')), percent(count('Pending'))) +
        stat('#ff6b7d', 'Failed', adNum(count('Failed')), percent(count('Failed'))) +
        stat('#9aa6bd', 'Refunded', adNum(count('Refunded')), percent(count('Refunded')));
    })();

    $('#oc').innerHTML =
      '<option>All concerts</option>' +
      concerts.map(c =>
        `<option ${c === ADO.concert ? 'selected' : ''}>${adEsc(c)}</option>`
      ).join('');

    upd();

  } catch (error) {
    AD_ORDERS_ERROR = error.message || 'Unknown error';
    $('#ot').innerHTML =
      `<div class="empty">Unable to load orders: ${adEsc(AD_ORDERS_ERROR)}</div>`;

    console.error('Admin orders error:', error);
  }

  adBindOrdTable();
}
