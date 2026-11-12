function seats(id) {
  const c = cc(id), S = sel();
  if (S.cid != id) W(SS, 'enc_sel', {cid: id, items: [], end: 0});
  sv = {zone: null, zoom: 1};
  return hdr('d')+`<div class="seatpage"><div class="panel map" id="mp"><h2>${c.title}</h2><p class="sub" style="margin:4px 0 14px">Select your seats / ${c.venue} / ${fmtDate(c.date)}</p><div class="zoom"><button id="zoomin">+</button><button id="zoomout">−</button></div><div id="mc"></div></div><div class="panel" id="bk"></div></div>`
}

function drawMap() {
  const id = location.hash.split('/')[2], c = cc(id), m = $('#mc');
  if (!m) return;
  const z = sv.zone && c.zones.find(x => x.k == sv.zone);
  m.innerHTML = (z ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><button class="back" id="bk0">← All Sections</button><b style="font-size:18px"><span style="color:${c.classes[z.cls].c}">●</span> ${z.label} &nbsp; <span style="color:#9aa6bd">${money(c.classes[z.cls].p)} / ticket</span></b></div><div class="stage">${detail(c,z)}</div>` : `<div class="stage">${overview(c)}</div>`)+legend(c);
  m.querySelector('svg').style.transform = `scale(${sv.zoom})`;
  if (z)$('#bk0').onclick = () => {
    sv.zone = null;
    drawMap()
  };
  m.querySelectorAll('[data-k]').forEach(g => g.onclick = () => {
    const zz = c.zones.find(x => x.k == g.dataset.k); if(isOut(c, zz))return toast(c.vn ? 'Khu này đã bán hết' : 'This section is sold out'); sv.zone = zz.k; drawMap()
  });
  m.querySelectorAll('[data-s]').forEach(g => g.onclick = () => pick(c, z, g.dataset.s));
  drawBook()
}

const pendingSeats = new Set();

async function pick(c, z, sid) {
  const S = sel();
  const key = z.k + '-' + sid;
  const seatId = z.dbZoneId + '-' + sid;
  const index = S.items.findIndex(x => x.key === key);

  if (pendingSeats.has(key)) return;
  pendingSeats.add(key);

  try {
    const token = localStorage.getItem('enc_token');

    if (!token) {
      toast('Please log in again');
      return;
    }

    // Bỏ giữ ghế
    if (index >= 0) {
      const item = S.items[index];

      if (item.holdId) {
        const res = await fetch(
          `/api/customer/seat-holds/${item.holdId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: 'Bearer ' + token
            }
          }
        );

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Unable to release seat');
        }
      }

      S.items.splice(index, 1);

      S.end = S.items.length
        ? Math.min(...S.items.map(x => x.expiresAt).filter(Boolean))
        : 0;

      W(SS, 'enc_sel', S);
      drawMap();
      return;
    }

    // Kiểm tra trạng thái ghế
    const status = st(c, z, sid);

    if (status === 'S' || status === 'H') {
      toast(status === 'S'
        ? 'This seat is sold'
        : 'This seat is being held by another customer');
      return;
    }

    if (S.items.length >= 6) {
      toast('Maximum 6 tickets per order');
      return;
    }

    // Gọi API giữ ghế trên TiDB Cloud
    const res = await fetch('/api/customer/seat-holds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ SeatID: seatId })
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Unable to hold seat');
    }

    const expiresAt = Date.parse(
      json.data.ExpiresAt.replace(' ', 'T')
    );

    S.items.push({
  key: key,
  seatId: seatId,
  zone: z.k,
      zone: z.k,
      zl: z.label,
      cls: z.cls,
      row: sid[0],
      n: Number(sid.slice(1)),
      price: c.classes[z.cls].p,
      holdId: json.data.HoldID,
      expiresAt: expiresAt
    });

    S.end = Math.min(
      ...S.items.map(x => x.expiresAt).filter(Boolean)
    );

    W(SS, 'enc_sel', S);
    drawMap();

  } catch (error) {
    toast(error.message);
  } finally {
    pendingSeats.delete(key);
  }
}

function drawBook() {
  const c = cc(sel().cid), S = sel(), sub = S.items.reduce((a, b) => a+b.price, 0), fee = S.items.length*c.fee;
  $('#bk').innerHTML = `<h2 style="margin:0">Your booking</h2><p class="sub" style="margin:6px 0 16px;font-size:13px">${c.title} • ${fmtDate(c.date)} • ${c.venue}</p><b style="font-size:13px">Selected seats</b><div style="margin-top:10px">${S.items.map((x,i)=>`<div class="sel"><div><b>${x.cls} - Row ${x.row}, Seat ${x.n}</b><small>${x.zl}</small></div><span><b>${money(x.price)}</b> <button data-x="${i}">✕</button></span></div>`).join('')||'<p class="sub">No seats selected yet.</p>'}</div>
 <div class="tot"><span>Subtotal</span><b>${money(sub)}</b></div><div class="tot"><span>Service fee</span><b>${money(fee)}</b></div><div class="tot big"><span>Total</span><b>${money(sub+fee)}</b></div>
 <div class="chip">● Seats held for <span id="hold">${mmss(S.end?Math.max(0,Math.round((S.end-Date.now())/1000)):600)}</span></div><p class="sub" style="font-size:12px">Maximum 6 tickets per order</p><br><button class="btn" style="width:100%" id="pay" ${S.items.length?'':'disabled'}>Continue to payment</button>`;
 $('#bk').querySelectorAll('[data-x]').forEach(b => {
  b.onclick = async () => {
    const S = sel();
    const item = S.items[Number(b.dataset.x)];

    if (!item) return;

    const zone = c.zones.find(z => z.k === item.zone);
    const sid = item.row + pad(item.n);

    if (zone) {
      await pick(c, zone, sid);
    }
  };
});
  $('#pay').onclick = () => location.hash = '#/checkout/'+c.id
}

function stimer() {
  drawMap();
  tmr = setInterval(() => {
    const S = sel(), h = $('#hold'); if(!S.end || !h)return; const s = Math.round((S.end-Date.now())/1000); if(s <= 0) {
      W(SS, 'enc_sel', {cid: S.cid, items: [], end: 0}); toast('Hold expired – seats released'); drawMap()
    } else h.textContent = mmss(s)
  }, 1000)
}
