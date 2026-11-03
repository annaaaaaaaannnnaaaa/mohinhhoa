//  ADMIN – Customers

const ADU = {f: 'All', q: '', sel: 'an.nguyen@mail.com'};

function aduFiltered() {
  const q = ADU.q.trim().toLowerCase();
  return AD_CUSTOMERS.filter(c => (ADU.f == 'All' || c.st == ADU.f) && (!q || (c.n+c.e).toLowerCase().includes(q)))
}

function aduTable() {
  const list = aduFiltered();
  return `<div class="ad-t cu"><div class="th"><span>CUSTOMER</span><span>ORDERS</span><span>TICKETS</span><span>TOTAL SPENT</span><span>LAST PURCHASE</span><span>STATUS</span></div>
${list.map(c => `<div class="tr cr ${c.e==ADU.sel?'sel':''}" data-e="${c.e}" tabindex="0"><div class="who"><i class="av" style="background:${c.col}">${adInitials(c.n)}</i><div><b>${c.n}</b><small>${c.e}</small></div></div><span>${c.o}</span><span>${c.t}</span><b>${c.spent} ₫</b><span class="mu">${c.last}</span><span>${adPill(c.st)}</span></div>`).join('') || '<div class="empty">No customers match this filter.</div>'}
<div class="tf"><span class="mu">Showing ${list.length} of 3,482 customers</span></div></div>`
}

function aduDetail() {
  const c = AD_CUSTOMERS.find(x => x.e == ADU.sel) || AD_CUSTOMERS[0];
  return `<div class="dh"><i class="av lg" style="background:${c.col}">${adInitials(c.n)}</i><div><h3>${c.n}</h3><span class="mu s">${c.e}</span></div>${adPill(c.st)}</div>
<div class="d3"><div><span class="mu s">Orders</span><b>${c.o}</b></div><div><span class="mu s">Tickets</span><b>${c.t}</b></div><div><span class="mu s">Total spent</span><b>${c.spent} ₫</b></div></div>
<h4>Recent orders</h4>${c.recent.map(r => `<div class="ro"><div><b>${r[0]}</b><small>${r[1]}</small></div><b class="am">${adMoney(r[2])}</b>${adPill(r[3])}</div>`).join('')}
<div class="d2"><div><span class="mu s">Phone</span><b>${c.phone}</b></div><div><span class="mu s">Member since</span><b>${c.since}</b></div></div>
<div class="btns"><button type="button" class="ab" id="vo">View all orders</button><button type="button" class="ab pu" id="se">Send email</button></div>`
}

function adpCustomers() {
  const stat = (l, v, s, up) => `<div class="stat sm"><div class="l">${l}</div><div class="row"><b>${v}</b><span class="${up?'gr':'gr'} s">${s}</span></div></div>`;
  return `<div class="ad-top"><div><h1>Customers</h1><p class="sub">Browse buyers, loyalty tiers and purchase history.</p></div><div class="acts"><button type="button" class="ab" id="ex">Export list</button></div></div>
<div class="stats4">${stat('Total customers', '3,482', 'Across all concerts')}${stat('New this week', '214', '↑ 12% vs last week')}${stat('Repeat buyers', '38%', 'Bought 2+ times')}${stat('Avg. order value', '3.1M ₫', 'Per customer order')}</div>
<div class="grid21 st cust"><div class="ad-card tbl"><div class="filters fin"><input class="ai" id="uq" placeholder="Search name or email…" value="${adEsc(ADU.q)}" style="width:290px"><div class="pills" id="uf">${['All', 'VIP', 'New', 'Blocked'].map(x => `<button type="button" data-f="${x}" class="${x==ADU.f?'on':''}">${x}</button>`).join('')}</div></div><div id="ut">${aduTable()}</div></div>
<div class="ad-card" id="ud">${aduDetail()}</div></div>`
}

function adBindCust() {
  document.querySelectorAll('#ut .cr').forEach(r => {
    const go = () => {
      ADU.sel = r.dataset.e;
      $('#ut').innerHTML = aduTable();
      $('#ud').innerHTML = aduDetail();
      adBindCust()
    };
    r.onclick = go;
    r.onkeydown = e => {
      if (e.key == 'Enter' || e.key == ' ') {
        e.preventDefault();
        go()
      }
    }
  });
  const c = AD_CUSTOMERS.find(x => x.e == ADU.sel) || AD_CUSTOMERS[0];
  $('#vo').onclick = () => {
    ADO.q = c.n;
    ADO.page = 1;
    location.hash = '#/admin/orders'
  };
  $('#se').onclick = () => {
    location.href = 'mailto:'+c.e+'?subject='+encodeURIComponent('Your ENCORE tickets');
    toast('Opening your email app…')
  }
}

function adbCustomers() {
  $('#uq').oninput = e => {
    ADU.q = e.target.value;
    $('#ut').innerHTML = aduTable();
    adBindCust()
  };
  document.querySelectorAll('#uf button').forEach(b => b.onclick = () => {
    ADU.f = b.dataset.f;
    document.querySelectorAll('#uf button').forEach(x => x.classList.toggle('on', x == b));
    $('#ut').innerHTML = aduTable();
    adBindCust()
  });
  $('#ex').onclick = () => {
    adDownload('customers.csv', 'Name,Email,Orders,Tickets,Total spent,Last purchase,Status\n'+AD_CUSTOMERS.map(c => [c.n, c.e, c.o, c.t, c.spent+' VND', c.last, c.st].join(',')).join('\n'));
    toast('Customer list exported')
  };
  adBindCust()
}
