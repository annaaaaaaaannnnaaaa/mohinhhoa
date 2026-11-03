//  ADMIN – Dashboard overview
const ADV = {range: '7D'};

function adSeg(id, cur, items) {
  return `<div class="seg2" id="${id}">${items.map(x => `<button type="button" data-v="${x}" class="${x==cur?'on':''}">${x}</button>`).join('')}</div>`
}

function adpOverview() {
  const list = adConcertList(), rev = AD_REV[ADV.range], recent = adAllOrders().slice(0, 5), ck = adCkState('arirang');
  const tiers = [['VIP', '470 / 500 · 94%', 94, AD_COL.pu], ['CAT 1', '820 / 1,000 · 82%', 82, AD_COL.pk], ['CAT 2', '610 / 1,000 · 61%', 61, AD_COL.tl], ['CAT 3', '380 / 1,000 · 38%', 38, AD_COL.or]];
  const stat = (l, v, s) => `<div class="stat"><div class="l">${l}</div><b>${v}</b><div class="g">${s}</div></div>`;
  return `<h1>Dashboard overview</h1><p class="sub">Manage concerts, ticket sales and venue check-in.</p>
<div class="stats4">${stat('Total concerts', String(list.length).padStart(2, '0'), list.filter(c => c.status == 'Upcoming').length+' upcoming')}${stat('Tickets sold', '1,248', 'Across all events')}${stat('Revenue (demo)', '1.62B VND', 'Simulated payments')}${stat('Checked-in', adNum(ck.entered), 'Current event')}</div>
<div class="grid21"><div class="ad-card"><div class="chd"><div><h3>Revenue overview</h3><p class="mu s">${rev.sub}</p></div>${adSeg('rg', ADV.range, ['7D', '30D', 'All'])}</div>${adArea(rev.labels, rev.v)}</div>
<div class="ad-card"><h3>Sales by tier</h3><p class="mu s">Arirang World Tour 2026</p><div class="tiers">${tiers.map(t => `<div class="ti"><div class="row"><b>${t[0]}</b><span class="mu s">${t[1]}</span></div><div class="bar2"><i style="width:${t[2]}%;background:${t[3]}"></i></div></div>`).join('')}</div></div></div>
<div class="grid21"><div class="ad-card"><div class="chd"><h3>Recent orders</h3><a class="lk" href="#/admin/orders">View all</a></div>
<div class="ad-t ovo"><div class="th"><span>ORDER</span><span>CUSTOMER</span><span>CONCERT</span><span>SEATS</span><span>AMOUNT</span><span>STATUS</span></div>
${recent.map(o => `<div class="tr"><b>${o.id}</b><span class="mu2">${adEsc(o.name)}</span><span class="mu2">${o.concert}</span><span class="mu2">${o.seats}</span><b>${adMoney(o.amount)}</b><span>${adPill(o.status)}</span></div>`).join('')}</div></div>
<div class="ad-card"><h3>Quick actions</h3><div class="qa"><a class="ab pu wide" href="#/admin/concerts/new">+ Create concert</a><a class="ab wide" href="#/admin/concerts">Manage seat inventory</a><a class="ab wide" href="#/admin/checkin">Open check-in console</a></div><p class="mu s" style="margin-top:14px">Next on-sale: Skynote opens in 2 days</p></div></div>`
}

function adbOverview() {
  document.querySelectorAll('#rg button').forEach(b => b.onclick = () => {
    ADV.range = b.dataset.v;
    adRefresh()
  })
}
