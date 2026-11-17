
// ADMIN – Customers (Database)

let ADU_DATA = [];

const ADU = {
  f: 'All',
  q: '',
  sel: ''
};

function aduMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function aduDate(value) {
  if (!value) return '-';

  const d = new Date(String(value).replace(' ', 'T'));

  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function aduStatus(c) {
  return Number(c.o) >= 2 ? 'Repeat' : 'New';
}

function aduFiltered() {
  const q = ADU.q.trim().toLowerCase();

  return ADU_DATA.filter(c => {
    const status = aduStatus(c);

    const matchStatus =
      ADU.f === 'All' || status === ADU.f;

    const matchSearch =
      !q ||
      [c.n, c.e, c.id].join(' ').toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });
}

function aduTable() {
  const list = aduFiltered();

  return `<div class="ad-t cu">
    <div class="th">
      <span>CUSTOMER</span>
      <span>ORDERS</span>
      <span>TICKETS</span>
      <span>TOTAL SPENT</span>
      <span>LAST PURCHASE</span>
      <span>STATUS</span>
    </div>

    ${list.map(c => `
      <div class="tr cr ${c.id === ADU.sel ? 'sel' : ''}"
           data-id="${adEsc(c.id)}"
           tabindex="0">

        <div class="who">
          <i class="av" style="background:${c.col}">
            ${adInitials(c.n)}
          </i>
          <div>
            <b>${adEsc(c.n)}</b>
            <small>${adEsc(c.e)}</small>
          </div>
        </div>

        <span>${c.o}</span>
        <span>${c.t}</span>
        <b>${aduMoney(c.spent)} ₫</b>
        <span class="mu">${aduDate(c.last)}</span>
        <span>${adPill(aduStatus(c))}</span>
      </div>
    `).join('') || '<div class="empty">No customers match this filter.</div>'}

    <div class="tf">
      <span class="mu">Showing ${list.length} of ${ADU_DATA.length} customers</span>
    </div>
  </div>`;
}

function aduDetail() {
  const c = ADU_DATA.find(x => x.id === ADU.sel);

  if (!c) {
    return '<div class="empty">Select a customer to view details.</div>';
  }

  const recent = c.recent || [];

  return `
    <div class="dh">
      <i class="av lg" style="background:${c.col}">
        ${adInitials(c.n)}
      </i>

      <div>
        <h3>${adEsc(c.n)}</h3>
        <span class="mu s">${adEsc(c.e)}</span>
      </div>

      ${adPill(aduStatus(c))}
    </div>

    <div class="d3">
      <div>
        <span class="mu s">Orders</span>
        <b>${c.o}</b>
      </div>

      <div>
        <span class="mu s">Tickets</span>
        <b>${c.t}</b>
      </div>

      <div>
        <span class="mu s">Total spent</span>
        <b>${aduMoney(c.spent)} ₫</b>
      </div>
    </div>

    <h4>Recent orders</h4>

    ${recent.length ? recent.map(r => `
      <div class="ro">
        <div>
          <b>${adEsc(r.id)}</b>
          <small>${adEsc(r.concert)} · ${r.tickets} tickets</small>
          <small>${aduDate(r.date)}</small>
        </div>

        <div>
          <b class="am">${adMoney(r.amount)}</b>
          ${adPill(r.status)}
        </div>
      </div>
    `).join('') : '<div class="empty">No orders found.</div>'}

    <div class="d2">
      <div>
        <span class="mu s">Phone</span>
        <b>${adEsc(c.phone || '-')}</b>
      </div>

      <div>
        <span class="mu s">Member since</span>
        <b>${aduDate(c.since)}</b>
      </div>
    </div>

    <div class="btns">
      <button type="button" class="ab" id="vo">View all orders</button>
      <button type="button" class="ab pu" id="se">Send email</button>
    </div>
  `;
}

function aduStats() {
  const totalCustomers = ADU_DATA.length;

  const repeatCustomers =
    ADU_DATA.filter(c => Number(c.o) >= 2).length;

  const totalOrders =
    ADU_DATA.reduce((sum, c) => sum + Number(c.o || 0), 0);

  const totalSpent =
    ADU_DATA.reduce((sum, c) => sum + Number(c.spent || 0), 0);

  const averageOrder =
    totalOrders ? totalSpent / totalOrders : 0;

  const stat = (label, value, sub) => `
    <div class="stat sm">
      <div class="l">${label}</div>
      <div class="row">
        <b>${value}</b>
        <span class="gr s">${sub}</span>
      </div>
    </div>
  `;

  return `
    <div class="stats4">
      ${stat('Total customers', totalCustomers, 'From database')}
      ${stat('Repeat buyers', repeatCustomers, '2+ orders')}
      ${stat('Total orders', totalOrders, 'All customers')}
      ${stat('Avg. order value', aduMoney(averageOrder) + ' ₫', 'Based on all orders')}
    </div>
  `;
}

function adpCustomers() {
  return `
    <div class="ad-top">
      <div>
        <h1>Customers</h1>
        <p class="sub">Browse buyers and purchase history.</p>
      </div>

      <div class="acts">
        <button type="button" class="ab" id="ex">Export list</button>
      </div>
    </div>

    ${aduStats()}

    <div class="grid21 st cust">
      <div class="ad-card tbl">
        <div class="filters fin">
          <input
            class="ai"
            id="uq"
            placeholder="Search name, email or ID…"
            value="${adEsc(ADU.q)}"
            style="width:290px"
          >

          <div class="pills" id="uf">
            ${['All', 'Repeat', 'New'].map(x => `
              <button
                type="button"
                data-f="${x}"
                class="${x === ADU.f ? 'on' : ''}"
              >${x}</button>
            `).join('')}
          </div>
        </div>

        <div id="ut">${aduTable()}</div>
      </div>

      <div class="ad-card" id="ud">
        ${aduDetail()}
      </div>
    </div>
  `;
}

function aduMapCustomers(data) {
  return data.map((c, index) => ({
    id: String(c.CustomerID || ''),
    n: c.FullName || 'Unknown customer',
    e: c.Email || '',
    phone: c.PhoneNumber || '',
    o: Number(c.TotalOrders || 0),
    t: Number(c.TotalTickets || 0),
    spent: Number(c.TotalSpent || 0),
    last: c.LastPurchase || '',
    since: c.MemberSince || '',
    col: [AD_COL.pu, AD_COL.pk, AD_COL.tl, AD_COL.or][index % 4],

    recent: (c.RecentOrders || []).map(r => ({
      id: r.BillID || '',
      concert: r.ConcertName || 'Unknown concert',
      amount: Number(r.TotalAmount || 0),
      tickets: Number(r.TotalTickets || 0),
      date: r.BillDate || '',
      status: r.PaymentStatus === 'Success'
        ? 'Paid'
        : (r.PaymentStatus || 'Pending')
    }))
  }));
}

function aduRender() {
  $('#ut').innerHTML = aduTable();
  $('#ud').innerHTML = aduDetail();
  adBindCust();
}

function adBindCust() {
  document.querySelectorAll('#ut .cr').forEach(r => {
    const go = () => {
      ADU.sel = r.dataset.id;
      aduRender();
    };

    r.onclick = go;

    r.onkeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    };
  });

  const c = ADU_DATA.find(x => x.id === ADU.sel);

  const viewOrders = $('#vo');
  const sendEmail = $('#se');

  if (viewOrders) {
    viewOrders.onclick = () => {
      if (!c) return;

      ADO.q = c.id;
      ADO.page = 1;
      location.hash = '#/admin/orders';
    };
  }

  if (sendEmail) {
    sendEmail.onclick = () => {
      if (!c || !c.e) return;

      location.href =
        'mailto:' + c.e +
        '?subject=' +
        encodeURIComponent('Your ENCORE tickets');

      toast('Opening your email app…');
    };
  }
}

function adbCustomers() {
  const search = $('#uq');

  search.oninput = e => {
    ADU.q = e.target.value;
    aduRender();
  };

  document.querySelectorAll('#uf button').forEach(b => {
    b.onclick = () => {
      ADU.f = b.dataset.f;

      document.querySelectorAll('#uf button').forEach(x => {
        x.classList.toggle('on', x === b);
      });

      aduRender();
    };
  });

  $('#ex').onclick = () => {
    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Orders',
      'Tickets',
      'Total spent',
      'Last purchase'
    ];

    const rows = ADU_DATA.map(c => [
      c.id,
      c.n,
      c.e,
      c.phone,
      c.o,
      c.t,
      c.spent,
      c.last
    ]);

    const csvCell = value =>
      '"' + String(value ?? '').replace(/"/g, '""') + '"';

    const csv = [
      headers.map(csvCell).join(','),
      ...rows.map(row => row.map(csvCell).join(','))
    ].join('\n');

    adDownload('customers.csv', csv);
    toast('Customer list exported');
  };

  // Load real customers from database
  (async () => {
    const token = localStorage.getItem('enc_token');

    try {
      const response = await fetch('/api/admin/customers', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not load customers');
      }

      ADU_DATA = aduMapCustomers(result.data || []);

      if (!ADU_DATA.some(c => c.id === ADU.sel)) {
        ADU.sel = ADU_DATA.length ? ADU_DATA[0].id : '';
      }

      // Update statistics and customer table
      const page = document.querySelector('.cust');

      if (page) {
        const stats = page.previousElementSibling;

        if (stats && stats.classList.contains('stats4')) {
          stats.outerHTML = aduStats();
        }
      }

      aduRender();

    } catch (error) {
      console.error('Customers API error:', error);

      $('#ut').innerHTML = `
        <div class="empty">
          Could not load customers: ${adEsc(error.message)}
        </div>
      `;

      $('#ud').innerHTML = `
        <div class="empty">
          Customer details are unavailable.
        </div>
      `;
    }
  })();
}
