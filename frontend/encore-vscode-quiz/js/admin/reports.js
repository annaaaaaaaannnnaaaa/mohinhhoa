
// ADMIN – Reports (real database data)

const ADR = {
  concert: 'All',
  range: '7D'
};

let ADR_DATA = null;
let ADR_CONCERTS = [];
let ADR_CACHE_KEY = '';
let ADR_LOADING_KEY = '';
let ADR_ERROR = '';

const ADR_COLORS = [
  AD_COL.pu,
  AD_COL.pk,
  AD_COL.or,
  AD_COL.tl
];

const adrEsc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const adrMoney = value => {
  const n = Number(value || 0);
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B ₫';
  return (n / 1e6).toFixed(2) + 'M ₫';
};

const adrDate = value => {
  if (!value) return '';
  const s = String(value);

  if (/^\d{4}-\d{2}$/.test(s)) {
    const [year, month] = s.split('-');
    return `${month}/${year.slice(2)}`;
  }

  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}` : s;
};

const adrHour = hour => String(hour).padStart(2, '0') + ':00';

function adrGetToken() {
  return localStorage.getItem('enc_token');
}

async function adrFetch(url) {
  const token = adrGetToken();

  if (!token) {
    throw new Error('Bạn chưa đăng nhập Admin.');
  }

  const res = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }

  return json;
}

async function adrLoadConcerts() {
  try {
    const json = await adrFetch('/api/admin/concerts');

    const rows = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json.concerts)
        ? json.concerts
        : [];

    ADR_CONCERTS = rows
      .filter(c => c.ConcertID && c.ConcertName)
      .map(c => ({
        id: String(c.ConcertID),
        name: String(c.ConcertName)
      }));

  } catch (err) {
    console.warn('Không tải được danh sách concert:', err);
  }
}

async function adrLoadReports() {
  const key = `${ADR.range}|${ADR.concert}`;

  if (ADR_CACHE_KEY === key && ADR_DATA) return;
  if (ADR_LOADING_KEY === key) return;

  ADR_LOADING_KEY = key;
  ADR_ERROR = '';

  try {
    const params = new URLSearchParams({
      range: ADR.range,
      concert_id: ADR.concert
    });

    const json = await adrFetch('/api/admin/reports?' + params.toString());

    ADR_DATA = json.data;
    ADR_CACHE_KEY = key;

    if (!ADR_CONCERTS.length) {
      ADR_CONCERTS = (ADR_DATA.byConcert || []).map(c => ({
        id: String(c.ConcertID),
        name: String(c.ConcertName)
      }));
    }

  } catch (err) {
    ADR_ERROR = err.message || 'Không tải được dữ liệu Reports.';
    console.error('Reports API error:', err);
  } finally {
    ADR_LOADING_KEY = '';
    adRefresh();
  }
}

function adpReports() {
  const data = ADR_DATA;
  const summary = data?.summary || {};

  const concertOptions = [
    { id: 'All', name: 'All concerts' },
    ...ADR_CONCERTS
  ];

  const opt = concertOptions.map(c => `
    <option value="${adrEsc(c.id)}"
      ${String(c.id) === ADR.concert ? 'selected' : ''}>
      ${adrEsc(c.name)}
    </option>
  `).join('');

  const kpi = (label, value, note = 'Selected period') => `
    <div class="stat">
      <div class="l">${label}</div>
      <b>${value}</b>
      <div class="g">${note}</div>
    </div>
  `;

  if (ADR_LOADING_KEY && !data) {
    return `
      <div class="ad-top">
        <div>
          <h1>Reports</h1>
          <p class="sub">Analyze sales, revenue and attendance across your concerts.</p>
        </div>
      </div>
      <div class="ad-card">Loading report data...</div>
    `;
  }

  if (ADR_ERROR && !data) {
    return `
      <div class="ad-top">
        <div>
          <h1>Reports</h1>
          <p class="sub">Analyze sales, revenue and attendance across your concerts.</p>
        </div>
      </div>
      <div class="ad-card">
        <h3>Unable to load reports</h3>
        <p class="mu">${adrEsc(ADR_ERROR)}</p>
        <button class="ab pu" id="retryReports">Try again</button>
      </div>
    `;
  }

  const trend = data?.trend || [];
  const byConcert = data?.byConcert || [];
  const byTier = data?.byTier || [];
  const peakHours = data?.peakHours || [];
  const paymentMethods = data?.paymentMethods || [];

  const labels = trend.map(x => adrDate(x.Period));
  const tickets = trend.map(x => Number(x.TicketsSold || 0));
  const revenues = trend.map(x => Number(x.Revenue || 0) / 1e6);

  const chart = trend.length && Math.max(...tickets) > 0
    ? adCombo(labels, tickets, revenues)
    : `<div class="mu" style="padding:45px;text-align:center">No sales data in this period.</div>`;

  const maxConcertRevenue = Math.max(
    1,
    ...byConcert.map(c => Number(c.Revenue || 0))
  );

  const concertRows = byConcert.length
    ? byConcert.map((c, i) => {
        const revenue = Number(c.Revenue || 0);
        const width = revenue / maxConcertRevenue * 100;

        return `
          <div class="ti">
            <div class="row">
              <b>${adrEsc(c.ConcertName)}</b>
              <b>${adrMoney(revenue)}</b>
            </div>
            <div class="bar2">
              <i style="width:${width}%;background:${ADR_COLORS[i % ADR_COLORS.length]}"></i>
            </div>
            <div class="mu s">${Number(c.TicketsSold || 0)} tickets sold</div>
          </div>
        `;
      }).join('')
    : `<p class="mu">No concert sales data.</p>`;

  const totalTickets = Number(summary.ticketsSold || 0);

  const tierRows = byTier.length
    ? byTier.map((t, i) => {
        const sold = Number(t.TicketsSold || 0);
        const revenue = Number(t.Revenue || 0);
        const share = totalTickets > 0
          ? sold / totalTickets * 100
          : 0;

        return `
          <div class="tr">
            <span class="cat">
              <i class="dot" style="background:${ADR_COLORS[i % ADR_COLORS.length]}"></i>
              <b>${adrEsc(t.ClassName)}</b>
            </span>
            <span class="mu2">${adNum(sold)}</span>
            <b>${adrMoney(revenue)}</b>
            <b>${share.toFixed(1)}%</b>
          </div>
        `;
      }).join('')
    : `<div class="tr"><span class="mu">No ticket class data.</span></div>`;

  const hourMap = {};
  peakHours.forEach(item => {
    hourMap[Number(item.PurchaseHour)] = Number(item.TotalOrders || 0);
  });

  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourMap[i] || 0
  }));

  const maxHourCount = Math.max(1, ...hours.map(h => h.count));
  const peak = hours.reduce(
    (best, current) => current.count > best.count ? current : best,
    { hour: 0, count: 0 }
  );

  const hourBars = hours.map(h => `
    <div class="hb">
      <i
        style="height:${h.count / maxHourCount * 100}%"
        class="${h.count > 0 && h.hour === peak.hour ? 'on' : ''}">
      </i>
      <span>${h.hour % 2 === 0 ? String(h.hour).padStart(2, '0') : ''}</span>
    </div>
  `).join('');

  const totalMethodOrders = paymentMethods.reduce(
    (sum, p) => sum + Number(p.TotalOrders || 0),
    0
  );

  const methodRows = paymentMethods.length
    ? paymentMethods.map((p, i) => {
        const count = Number(p.TotalOrders || 0);
        const revenue = Number(p.Revenue || 0);
        const share = totalMethodOrders > 0
          ? count / totalMethodOrders * 100
          : 0;

        return `
          <div class="ti">
            <div class="row">
              <span>
                <i class="dot" style="background:${ADR_COLORS[i % ADR_COLORS.length]}"></i>
                <b>${adrEsc(p.PaymentMethod || 'Unknown')}</b>
              </span>
              <b>${share.toFixed(1)}%</b>
            </div>
            <div class="bar2">
              <i style="width:${share}%;background:${ADR_COLORS[i % ADR_COLORS.length]}"></i>
            </div>
            <div class="row mu s">
              <span>${count} orders</span>
              <span>${adrMoney(revenue)}</span>
            </div>
          </div>
        `;
      }).join('')
    : `<p class="mu">No payment method data.</p>`;

  return `
<div class="ad-top">
  <div>
    <h1>Reports</h1>
    <p class="sub">Analyze sales, revenue and attendance across your concerts.</p>
  </div>
  <div class="acts">
    <select class="ai" id="rc" style="width:232px" aria-label="Concert">
      ${opt}
    </select>
    ${adSeg('rr', ADR.range, ['7D', '30D', 'All'])}
    <button type="button" class="ab pu" id="pdf">Export PDF</button>
  </div>
</div>

<div class="stats5">
  ${kpi('Gross revenue', adrMoney(summary.grossRevenue))}
  ${kpi('Revenue before costs', adrMoney(summary.netRevenue), 'Costs not deducted')}
  ${kpi('Tickets sold', adNum(totalTickets))}
  ${kpi('Avg. ticket price', adrMoney(summary.averageTicketPrice))}
  ${kpi('Refund rate', '—', 'No refund data')}
</div>

<div class="grid21">
  <div class="ad-card">
    <div class="chd">
      <div>
        <h3>Revenue and tickets sold</h3>
        <p class="mu s">${ADR.range} · Selected period</p>
      </div>
      <div class="lgd">
        <span><i class="sq"></i>Tickets sold</span>
        <span><i class="ring"></i>Revenue</span>
      </div>
    </div>
    ${chart}
  </div>

  <div class="ad-card">
    <h3>Sales by payment method</h3>
    <p class="mu s">Share of successful orders</p>
    <div class="tiers">
      ${methodRows}
    </div>
  </div>
</div>

<div class="grid3">
  <div class="ad-card">
    <h3>Revenue by concert</h3>
    <div class="tiers">${concertRows}</div>
  </div>

  <div class="ad-card">
    <h3>Sales by tier</h3>
    <div class="ad-t tr4">
      <div class="th">
        <span>TIER</span>
        <span>SOLD</span>
        <span>REVENUE</span>
        <span>SHARE</span>
      </div>
      ${tierRows}
    </div>
  </div>

  <div class="ad-card">
    <div class="chd">
      <h3>Peak purchase hours</h3>
      <b class="pk">${peak.count > 0 ? `Peak: ${adrHour(peak.hour)}` : 'No data'}</b>
    </div>
    <div class="hrs">${hourBars}</div>
  </div>
</div>
`;
}

function adbReports() {
  const concertSelect = $('#rc');

  if (concertSelect) {
    concertSelect.onchange = e => {
      ADR.concert = e.target.value;
      adRefresh();
    };
  }

  document.querySelectorAll('#rr button').forEach(button => {
    button.onclick = () => {
      ADR.range = button.dataset.v;
      adRefresh();
    };
  });

  const pdfButton = $('#pdf');

  if (pdfButton) {
    pdfButton.onclick = () => {
      toast('Opening print dialog – choose “Save as PDF”');
      setTimeout(() => window.print(), 400);
    };
  }

  const retryButton = $('#retryReports');

  if (retryButton) {
    retryButton.onclick = () => {
      ADR_CACHE_KEY = '';
      adrLoadReports();
    };
  }

  if (!ADR_CONCERTS.length) {
    adrLoadConcerts().then(() => adRefresh());
  }

  adrLoadReports();
}