function qr(code) {
  let h = 0;
  for (const ch of code) h = (h*31+ch.charCodeAt(0))>>>0;
  const N = 25;
  let s = `<svg viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges">`;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let on;
    const f = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
    if (f) {
      const ex = x > 16 ? x-17 : x, ey = y > 16 ? y-17 : y;
      on = ex < 7 && ey < 7 && (ex == 0 || ex == 6 || ey == 0 || ey == 6 || (ex > 1 && ex < 5 && ey > 1 && ey < 5))
    } else {
      h = (h*1664525+1013904223)>>>0;
      on = (h>>>28)&1
    }
    if (on) s += `<rect x="${x}" y="${y}" width="1" height="1" fill="#141a2b"/>`
  } return s+'</svg>'
}

function tickets() {
  const u = user(), all = orders().filter(o => o.email == u.email).flatMap(o => o.items.map(i => ({...i, cid: o.cid, name: o.name})));
  if (!all.length) return hdr('t')+`<div class="wrap"><h1 style="font-size:34px">My tickets</h1><p class="sub">You have no tickets yet.</p><a class="btn" href="#/">Discover concerts</a></div>`;
  const i = ((+SS.getItem('enc_ti') || 0)%all.length);
  const k = all[i];
  const c = cc(k.cid);
  return hdr('t')+`<div class="wrap"><h1 style="font-size:34px">My tickets</h1><p class="sub">Your concert passes are ready. Present the QR code at entry.</p><div class="panel tk" style="padding:30px">
 <div class="pic" style="background-image:linear-gradient(#0003,#000a),url(${c.poster})"><small>ENCORE PRESENTS</small><div><h2>${c.tag=='SKETCH A ROSE'?'Sketch a Rose':c.tag}</h2><p>${fmtDate(c.date)} • ${c.time}</p><p style="font-weight:400;color:#cbd5e1">${c.venue}, ${c.city}</p></div><p>${k.cls} • SEAT ${k.row}${k.n}</p></div>
 <div style="position:relative"><small class="sub" style="font-weight:700">E-TICKET / ORDER #${k.order}</small><span class="vd">VALID</span><div style="display:flex;gap:46px;margin-top:20px;align-items:center;flex-wrap:wrap"><div class="qr">${qr(k.code+k.tid)}</div>
 <div><small class="sub">Ticket holder</small><h3>${k.name}</h3><br><small class="sub">Ticket ID</small><h3>${k.tid}</h3><br><small class="sub">Check-in status</small><h3 style="color:var(--g)">${k.checked?'Checked in':'Not checked in'}</h3></div></div>
 <p style="color:var(--or);font-size:13px;margin-top:20px">QR illustration — live app must generate a unique valid token. (${k.code})</p></div></div>${all.length>1?`<button class="nx" id="nx">➜</button>`:''}</div>`
}

// Trang Help
function help() {
  return hdr('h')+`<div class="wrap"><h1 style="font-size:34px">Help</h1><p class="sub">Demo accounts: nguoimua@gmail.com / admin@concert.vn · password <b>${PASSWORD}</b>. Payments are simulated; no real money is charged.</p><p class="sub"><a class="lnk" href="#" onclick="if(confirm('Delete all demo orders and settings?'))resetDemo();return false">Reset demo data</a></p></div>`
}
