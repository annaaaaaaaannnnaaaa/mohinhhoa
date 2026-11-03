//  ADMIN – Reports  
const ADR = {concert: 'All concerts', range: '7D'};
const AD_SHARE = {'All concerts': 1, 'Arirang World Tour': 820/1620, 'Skynote': 540/1620, 'Sketch A Rose': 260/1620};
const AD_RFAC = {'7D': 1, '30D': 3.6, 'All': 6.2};
const adBig = m => m >= 1000 ? (m/1000).toFixed(2)+'B ₫' : Math.round(m)+'M ₫';

function adpReports() {
  const share = AD_SHARE[ADR.concert], k = share*AD_RFAC[ADR.range], prev = {'7D': 'previous 7 days', '30D': 'previous 30 days', 'All': 'previous period'}[ADR.range];
  const gross = 1620*k, net = 1480*k, tickets = Math.round(1248*k), refund = {'All concerts': 1.5, 'Arirang World Tour': 1.8, 'Skynote': 1.2, 'Sketch A Rose': 1.1}[ADR.concert];
  const kpi = (l, v, d, down) => `<div class="stat"><div class="l">${l}</div><b>${v}</b><div class="g">${down ? '↓' : '↑'} ${d} vs ${prev}</div></div>`;
  const src = AD_REV[ADR.range], rev = src.v.map(v => v*share), tk = ADR.range == '7D' ? [112, 142, 128, 198, 180, 248, 240].map(v => v*share) : src.v.map(v => v*.77*share);
  const chans = [['Website', AD_COL.pu, 52], ['Mobile app', AD_COL.pk, 31], ['Partners', AD_COL.tl, 17]];
  const byCon = [['Arirang World Tour', 820, AD_COL.pu], ['Skynote', 540, AD_COL.pk], ['Sketch A Rose', 260, AD_COL.or]].filter(c => ADR.concert == 'All concerts' || c[0] == ADR.concert).map(c => [c[0], c[1]*AD_RFAC[ADR.range], c[2]]);
  const mx = Math.max(...byCon.map(c => c[1]));
  const tiers = [['VIP', 470, 615, 38, AD_COL.pu], ['CAT 1', 410, 551, 34, AD_COL.pk], ['CAT 2', 248, 292, 18, AD_COL.tl], ['CAT 3', 120, 162, 10, AD_COL.or]];
  const hrs = [24, 34, 46, 40, 37, 48, 59, 70, 89, 129, 94, 54], hl = {0: '08', 3: '11', 6: '14', 9: '20', 11: '22'};
  const opt = (a, c) => a.map(x => `<option ${x==c?'selected':''}>${x}</option>`).join('');
  return `<div class="ad-top"><div><h1>Reports</h1><p class="sub">Analyze sales, revenue and attendance across your concerts.</p></div><div class="acts"><select class="ai" id="rc" style="width:232px" aria-label="Concert">${opt(Object.keys(AD_SHARE), ADR.concert)}</select>${adSeg('rr', ADR.range, ['7D', '30D', 'All'])}<button type="button" class="ab pu" id="pdf">Export PDF</button></div></div>
<div class="stats5">${kpi('Gross revenue', adBig(gross), '12.4%')}${kpi('Net revenue', adBig(net), '10.9%')}${kpi('Tickets sold', adNum(tickets), '8.1%')}${kpi('Avg. ticket price', (gross/tickets).toFixed(1)+'M ₫', '3.9%')}${kpi('Refund rate', refund.toFixed(1)+'%', '0.3%', 1)}</div>
<div class="grid21"><div class="ad-card"><div class="chd"><div><h3>Revenue and tickets sold</h3><p class="mu s">${ADR.range == '7D' ? 'Oct 13 – Oct 19, 2026' : src.sub.split(' · ')[0]}</p></div><div class="lgd"><span><i class="sq"></i>Tickets sold</span><span><i class="ring"></i>Revenue</span></div></div>${adCombo(src.labels, tk, rev)}</div>
<div class="ad-card"><h3>Sales by channel</h3><p class="mu s">Share of tickets sold</p><div class="chan">${adDonut(tickets)}<div class="cl">${chans.map(c => `<div class="row"><span><i class="dot" style="background:${c[1]}"></i><b>${c[0]}</b></span><b>${c[2]}%</b></div>`).join('')}</div></div></div></div>
<div class="grid3"><div class="ad-card"><h3>Revenue by concert</h3><div class="tiers">${byCon.map(c => `<div class="ti"><div class="row"><b>${c[0]}</b><b>${adBig(c[1])}</b></div><div class="bar2"><i style="width:${c[1]/mx*100}%;background:${c[2]}"></i></div></div>`).join('')}</div></div>
<div class="ad-card"><h3>Sales by tier</h3><div class="ad-t tr4"><div class="th"><span>TIER</span><span>SOLD</span><span>REVENUE</span><span>SHARE</span></div>${tiers.map(t => `<div class="tr"><span class="cat"><i class="dot" style="background:${t[4]}"></i><b>${t[0]}</b></span><span class="mu2">${adNum(t[1]*k)}</span><b>${adBig(t[2]*k)}</b><b>${t[3]}%</b></div>`).join('')}</div></div>
<div class="ad-card"><div class="chd"><h3>Peak purchase hours</h3><b class="pk">Peak: 20:00</b></div><div class="hrs">${hrs.map((h, i) => `<div class="hb"><i style="height:${h/129*100}%" class="${i==9?'on':''}"></i><span>${hl[i] || ''}</span></div>`).join('')}</div></div></div>`
}

function adbReports() {
  $('#rc').onchange = e => {
    ADR.concert = e.target.value;
    adRefresh()
  };
  document.querySelectorAll('#rr button').forEach(b => b.onclick = () => {
    ADR.range = b.dataset.v;
    adRefresh()
  });
  $('#pdf').onclick = () => {
    toast('Opening print dialog – choose “Save as PDF”');
    setTimeout(() => window.print(), 400)
  }
}
