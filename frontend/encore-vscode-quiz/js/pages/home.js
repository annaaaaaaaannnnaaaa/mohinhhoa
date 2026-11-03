function home() {
  const q = (SS.getItem('enc_q') || '').toLowerCase(), list = CONCERTS.filter(c => (c.title+c.artist+c.city).toLowerCase().includes(q));
  return hdr('d')+`<div class="wrap"><div class="kick">FIND YOUR NEXT</div><h1>UNFORGETTABLE NIGHT.</h1><p class="sub">Explore upcoming concerts, choose your seat and secure your ticket.</p>
<div class="search"><input id="q" placeholder="⌕ Search concerts, artists, or cities..." value="${SS.getItem('enc_q')||''}"><button class="btn" id="sq">Search events</button></div>
<h2>Upcoming concerts</h2><div class="grid">${list.map(c=>`<div class="card"><div class="poster"><img src="${c.poster}" alt="${c.title}"><small>LIVE MUSIC • 2026</small><b>${c.tag}</b></div>
<h3>${c.card}</h3><p>${c.city} · ${fmtDate(c.date)}</p><div class="row"><span class="price">From ${c.from} VND</span><a class="btn" href="#/queue/${c.id}">View seats</a></div></div>`).join('')||'<div class="empty">No concerts found.</div>'}</div></div>`
}
