//  ADMIN – Ticket check-in
const ADK = {key: 'arirang', gate: 'Gate A', token: 'TKT-8F2A-1045', res: undefined, scan: 0};

function adCkState(key) {
  return (adStore().ck || {})[key] || clone(AD_CK0[key])
}

function adCkSave(key, st) {
  adSave({ck: {...(adStore().ck || {}), [key]: st}})
}

const adCkTitle = key => (adConcertList().find(c => c.key == key) || {}).title || (cc(key) || {}).title || key;
const adNow = () => new Date().toTimeString().slice(0, 8);

function adCkFind(token) {
  const T = token.trim().toUpperCase();
  for (const o of orders()) {
    if (!o || !Array.isArray(o.items)) continue;
    const x = o.items.find(i => String(i.tid).toUpperCase() == T);
    if (x) return {holder: o.name, key: o.cid, seat: x.cls+' · Row '+x.row+' · Seat '+x.n, real: true, checked: !!x.checked}
  }
  const d = AD_TICKETS[T];
  return d ? {...d} : null
}

function adCkCheck(token) {
  const T = token.trim().toUpperCase(), f = adCkFind(T), st = adCkState(ADK.key);
  if (!f) return {kind: 'invalid', token: T, reason: 'Ticket not found'};
  if (f.key != ADK.key) return {kind: 'invalid', token: T, f, reason: 'Ticket is for '+adCkTitle(f.key)};
  if (f.checked || st.done.includes(T)) return {kind: 'dup', token: T, f};
  return {kind: 'valid', token: T, f}
}

function adCkLog(st, token, holder, status) {
  st.log.unshift([token, holder, adNow(), status]);
  st.log = st.log.slice(0, 60)
}

function adCkResult() {
  const r = ADK.res;
  if (!r) return `<div class="res none"><span class="mu">Enter a ticket token or click the scan area, then choose Validate ticket.</span></div>`;
  const f = r.f || {}, title = f.key ? adCkTitle(f.key) : '—';
  const fields = `<div class="fl"><div><small>Holder</small><b>${adEsc(f.holder || 'Unknown')}</b></div><div><small>Ticket ID</small><b>${adEsc(r.token)}</b></div><div><small>Concert</small><b>${adEsc(title)}</b></div><div><small>Seat</small><b>${adEsc(f.seat || '—')}</b></div></div>`;
  const ico = {valid: '✓', done: '✓', dup: '!', invalid: '✕'}[r.kind];
  const head = {valid: 'VALID TICKET', done: 'CHECKED IN', dup: 'ALREADY CHECKED IN', invalid: 'INVALID TICKET'}[r.kind];
  const side = {valid: 'Not yet checked in', done: 'Checked in at '+r.at, dup: 'Duplicate scan', invalid: r.reason}[r.kind];
  const btns = r.kind == 'valid' ? `<button type="button" class="ab gr" id="kok">Confirm check-in</button><button type="button" class="ab" id="kno">Reject</button>`
    : r.kind == 'done' ? `<button type="button" class="ab" id="kno">Next ticket</button>` : `<button type="button" class="ab" id="kno">Dismiss</button>`;
  return `<div class="res ${r.kind}"><div class="rh"><b><i class="ic">${ico}</i>${head}</b><span>${adEsc(side)}</span></div>${r.kind == 'invalid' && !r.f ? `<div class="fl one"><div><small>Ticket ID</small><b>${adEsc(r.token)}</b></div></div>` : fields}<div class="btns l">${btns}</div></div>`
}

function adCkRight() {
  const st = adCkState(ADK.key), pct = Math.round(st.entered/st.total*100);
  return `<div class="ad-card"><div class="chd"><h3>Gate progress</h3><b class="tl">${pct}%</b></div><div class="big"><b>${adNum(st.entered)}</b><span class="mu"> / ${adNum(st.total)} guests entered</span></div><div class="bar2 tlb"><i style="width:${pct}%"></i></div>
<div class="d3 k"><div><span class="mu s"><i class="dot" style="background:#2fd5a0"></i>Valid scans</span><b>${adNum(st.valid)}</b></div><div><span class="mu s"><i class="dot" style="background:#ffb95a"></i>Duplicates</span><b>${adNum(st.dup)}</b></div><div><span class="mu s"><i class="dot" style="background:#ff6b7d"></i>Invalid</span><b>${adNum(st.inv)}</b></div></div></div>
<div class="ad-card"><div class="chd"><h3>Recent validations</h3><span class="live"><i class="dot" style="background:#2fd5a0"></i>Live</span></div>
<div class="ad-t rv"><div class="th"><span>TICKET</span><span>HOLDER</span><span>TIME</span><span>STATUS</span></div>
${st.log.slice(0, 6).map(l => `<div class="tr"><b>${l[0]}</b><span class="mu2">${adEsc(l[1])}</span><span class="mu">${l[2]}</span><span>${adPill(l[3])}</span></div>`).join('') || '<div class="empty">No scans yet for this concert.</div>'}</div>
<a class="lk" href="#" id="klog">View full validation log →</a></div>`
}

function adpCheckin() {
  if (ADK.res === undefined) ADK.res = adCkCheck(ADK.token);
  const cons = adConcertList().filter(c => c.key);
  return `<div class="ad-top"><div><h1>Ticket check-in</h1><p class="sub">Validate entries at the venue gate in real time.</p></div><div class="acts"><select class="ai" id="kc" style="width:251px" aria-label="Concert">${cons.map(c => `<option value="${c.key}" ${c.key==ADK.key?'selected':''}>${adEsc(c.key == 'arirang' ? 'Arirang World Tour 2026' : c.title)}</option>`).join('')}</select>
<select class="ai" id="kg" style="width:97px" aria-label="Gate">${['Gate A', 'Gate B', 'Gate C'].map(g => `<option ${g==ADK.gate?'selected':''}>${g}</option>`).join('')}</select></div></div>
<div class="grid2 st ck"><div class="ad-card"><h3>Scan or enter ticket token</h3>
<div class="scan" id="scan" role="button" tabindex="0" title="Click to simulate a scan"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><div class="box"><u></u></div><span>Align the QR code within the frame</span></div>
<div class="tkrow"><input class="ai" id="tk" value="${adEsc(ADK.token)}" placeholder="TKT-XXXX-0000" aria-label="Ticket token" autocomplete="off"><button type="button" class="ab pu" id="kv">Validate ticket</button></div>
<div id="kres">${adCkResult()}</div></div><div class="col" id="kright">${adCkRight()}</div></div>`
}

function adCkBindRes() {
  const ok = $('#kok'), no = $('#kno');
  if (ok) ok.onclick = () => {
    const r = ADK.res, st = adCkState(ADK.key);
    st.entered++;
    st.valid++;
    st.done.push(r.token);
    adCkLog(st, r.token, r.f.holder, 'Valid');
    adCkSave(ADK.key, st);
    if (r.f.real) {
      const all = orders();
      all.forEach(o => (o.items || []).forEach(x => {
        if (String(x.tid).toUpperCase() == r.token) x.checked = true
      }));
      W(LS, 'enc_orders', all)
    }
    ADK.res = {...r, kind: 'done', at: adNow()};
    toast('Checked in: '+r.f.holder);
    adCkPaint()
  };
  if (no) no.onclick = () => {
    if (ADK.res && ADK.res.kind == 'valid') toast('Ticket rejected');
    ADK.res = null;
    adCkPaint()
  }
}

function adCkPaint() {
  $('#kres').innerHTML = adCkResult();
  $('#kright').innerHTML = adCkRight();
  adCkBindRes();
  adCkBindLog()
}

function adCkBindLog() {
  const l = $('#klog');
  if (l) l.onclick = e => {
    e.preventDefault();
    const st = adCkState(ADK.key);
    adModal('Validation log · '+adCkTitle(ADK.key), `<div class="ad-t rv full"><div class="th"><span>TICKET</span><span>HOLDER</span><span>TIME</span><span>STATUS</span></div>${st.log.map(x => `<div class="tr"><b>${x[0]}</b><span class="mu2">${adEsc(x[1])}</span><span class="mu">${x[2]}</span><span>${adPill(x[3])}</span></div>`).join('') || '<div class="empty">No scans yet.</div>'}</div>`)
  }
}

function adCkValidate() {
  const token = $('#tk').value.trim();
  if (!token) return toast('Enter or scan a ticket token');
  ADK.token = token;
  const r = adCkCheck(token), st = adCkState(ADK.key);
  if (r.kind == 'invalid') {
    st.inv++;
    adCkLog(st, r.token, (r.f || {}).holder || 'Unknown', 'Invalid');
    adCkSave(ADK.key, st)
  }
  if (r.kind == 'dup') {
    st.dup++;
    adCkLog(st, r.token, r.f.holder, 'Duplicate');
    adCkSave(ADK.key, st)
  }
  ADK.res = r;
  adCkPaint()
}

function adbCheckin() {
  $('#kc').onchange = e => {
    ADK.key = e.target.value;
    ADK.res = null;
    adRefresh()
  };
  $('#kg').onchange = e => ADK.gate = e.target.value;
  $('#kv').onclick = adCkValidate;
  $('#tk').onkeydown = e => {
    if (e.key == 'Enter') adCkValidate()
  };
  const scan = () => {
    // Giả lập quét QR: lần lượt lấy mã vé mẫu / vé thật chưa soát
    const real = [];
    orders().forEach(o => (o && o.items || []).forEach(x => !x.checked && o.cid == ADK.key && real.push(x.tid)));
    const pool = real.concat(Object.keys(AD_TICKETS)), t = pool[ADK.scan++ % pool.length];
    $('#tk').value = t;
    adCkValidate()
  };
  $('#scan').onclick = scan;
  $('#scan').onkeydown = e => {
    if (e.key == 'Enter' || e.key == ' ') {
      e.preventDefault();
      scan()
    }
  };
  adCkBindRes();
  adCkBindLog()
}
