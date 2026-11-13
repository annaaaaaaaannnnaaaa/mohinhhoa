
function checkout(id) {
  const c = cc(id), S = sel();

  if (S.cid != id || !S.items.length) {
    location.hash = '#/seats/' + id;
    return '';
  }

  const sub = S.items.reduce((a, b) => a + b.price, 0);
  const fee = S.items.length * c.fee;
  const cl = {};

  S.items.forEach(x => {
    (cl[x.cls] = cl[x.cls] || []).push(x);
  });

  return hdr('d') + `<div class="wrap">
    <h1 style="font-size:32px">Complete your booking</h1>
    <p class="sub">Your selected seats are temporarily reserved.</p>

    <div class="two" style="grid-template-columns:1.15fr 1fr">
      <div class="panel">
        <h2 style="margin-top:0">Order summary</h2>
        <b style="font-size:18px">${c.title}</b>
        <p class="sub" style="margin:6px 0 18px">
          ${c.venue} • ${fmtDate(c.date)} • ${c.time}
        </p>
        <hr style="border-color:var(--b)">

        ${Object.entries(cl).map(([k, a]) => `
          <div class="tot">
            <span>${a.length} × ${k} - Tickets (${a.map(x => x.row + x.n).join(', ')})</span>
            <b>${(a.length * a[0].price).toLocaleString('de-DE')}</b>
          </div>
        `).join('')}

        <div class="tot">
          <span>Service fee (${c.fee.toLocaleString('de-DE')} ₫ / ticket)</span>
          <b>${fee.toLocaleString('de-DE')}</b>
        </div>

        <b>Payment method</b>
        <div class="demo">◉ Demo payment — No real money charged</div>
        <hr style="border-color:var(--b)">

        <div class="tot big">
          <span style="color:var(--m);font-weight:400">Total</span>
          <span>${(sub + fee).toLocaleString('de-DE')} VND</span>
        </div>
      </div>

      <div class="panel">
        <h2 style="margin-top:0">Seat lock timer</h2>
        <div class="timer" id="ct">10:00</div>
        <p class="sub" style="text-align:center;margin:0 0 14px">Time remaining</p>
        <div class="bar"><i id="cb" style="width:100%"></i></div>
        <p class="sub" style="margin-top:26px;font-size:13px">
          When time expires, seats become available again.
        </p>
        <br>
        <button class="btn" style="width:100%" id="ok">
          Confirm demo payment
        </button>
        <p class="ok">Secure checkout simulation</p>
      </div>
    </div>
  </div>`;
}


function ctimer(id) {
  const c = cc(id);
  if (!c || !$('#ct')) return;

  const tick = () => {
    const S = sel();
    const s = Math.round((S.end - Date.now()) / 1000);

    if (s <= 0) {
      W(SS, 'enc_sel', { cid: id, items: [], end: 0 });
      toast('Time expired - seats released');
      location.hash = '#/seats/' + id;
      return;
    }

    $('#ct').textContent = mmss(s);
    $('#cb').style.width = (s / 6) + '%';
  };

  tick();
  tmr = setInterval(tick, 1000);

  const button = $('#ok');

  button.onclick = async () => {
    const S = sel();
    const u = user();
    const token = localStorage.getItem('enc_token');

    if (!token) {
      toast('Please log in again');
      location.hash = '#/login';
      return;
    }

    if (!S.items.length || S.cid != id) {
      toast('No seats selected');
      location.hash = '#/seats/' + id;
      return;
    }

    const holdIds = S.items.map(x => Number(x.holdId));

    if (holdIds.some(x => !Number.isInteger(x) || x <= 0)) {
      toast('Invalid seat reservation. Please select your seats again.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Processing payment...';

    try {
      const res = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          ConcertID: ({
  arirang: 'CON01',
  skynote: 'CON02',
  sketch: 'CON03'
})[id],
          HoldIDs: holdIds
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Payment failed');
      }

      const data = json.data;

      if (!data || !data.BillID || !Array.isArray(data.Tickets)) {
        throw new Error('Invalid checkout response from server');
      }

      // Match tickets returned by the database with selected seats.
      const items = data.Tickets.map((ticket, index) => {
        const selected = S.items.find(
          x => String(x.seatId) === String(ticket.SeatID)
        ) || S.items[index];

        return {
          key: selected.key,
          seatId: ticket.SeatID,
          zone: selected.zone,
          zl: ticket.ZoneName || selected.zl,
          cls: selected.cls,
          row: ticket.RowNumber || selected.row,
          n: Number(ticket.SeatNumber || selected.n),
          price: Number(ticket.UnitPrice),
          tid: ticket.TicketID,
          code: ticket.UniqueCode,
          order: data.BillID,
          checked: false
        };
      });

      const d = new Date();

      // Cache the actual successful backend result for existing pages.
      const ord = {
        id: data.BillID,
        cid: id,
        email: u.email,
        name: u.name,
        paid:
          pad(d.getHours()) + ':' + pad(d.getMinutes()) +
          ' · ' + pad(d.getDate()) + '/' +
          pad(d.getMonth() + 1) + '/' + d.getFullYear(),
        sub: Number(data.Subtotal),
        fee: Number(data.ServiceFee),
        total: Number(data.TotalAmount),
        paymentId: data.PaymentID,
        items: items
      };

      W(LS, 'enc_orders', orders().concat(ord));

      W(
        LS,
        'enc_sold',
        soldLocal().concat(S.items.map(x => id + '|' + x.key))
      );

      W(SS, 'enc_sel', {
        cid: null,
        items: [],
        end: 0
      });

      clearInterval(tmr);
      location.hash = '#/success/' + data.BillID;

    } catch (error) {
      console.error('Checkout error:', error);
      toast(error.message || 'Unable to complete payment');

      button.disabled = false;
      button.textContent = 'Confirm demo payment';
    }
  };
}


function success(oid) {
  const o = orders().find(x => String(x.id) === String(oid));
  const c = o && cc(o.cid);

  if (!o || !c || !o.items || !o.items.length) {
    location.hash = '#/';
    return '';
  }

  const a = o.items[0];
  const bg = `linear-gradient(#0005,#000b),url(${c.poster})`;

  return hdr('d') + `
    <div class="wrap done">
      <div class="tick">✓</div>

      <h1 style="font-size:34px;margin:14px 0 6px">
        Payment Successful!
      </h1>

      <p class="sub">
        Thank you, ${o.name}! Your tickets have been booked successfully.
        See you at the concert!
      </p>

      <div class="two" style="grid-template-columns:1.1fr 1fr;max-width:1080px;margin:auto">

        <div class="ev">
          <div class="hd" style="background-image:${bg}">
            <small>Live Music • 2026</small>
            <h2>${c.title}</h2>
            <small>Unforgettable moment</small>
          </div>

          <div style="padding:20px 24px;display:flex;gap:50px">
            <div>
              <small class="sub">Time</small><br>
              <b>${c.time} • ${fmtDate(c.date)}</b><br>
              <small class="sub">Open at ${c.doors}</small>
            </div>

            <div>
              <small class="sub">Address</small><br>
              <b>${c.venue}</b><br>
              <small class="sub">${c.addr}</small>
            </div>
          </div>

          <div class="sel" style="margin:0 24px">
            <div>
              <b>${a.cls} • ${a.zl}</b>
              <small>
                Row ${a.row} · Seats ${o.items.map(x => x.n).join(', ')}
              </small>
            </div>

            <div style="text-align:right">
              <b>${String(o.items.length).padStart(2, '0')} tickets</b>
              <small>${a.price.toLocaleString('de-DE')} ₫ / ticket</small>
            </div>
          </div>

          <p class="ok" style="text-align:left;margin:14px 24px">
            ✓ Your e-tickets have been issued and your seats have been confirmed.
          </p>
        </div>

        <div class="panel" style="text-align:left">
          <h2 style="margin-top:0">
            Order Summary
            <span class="chip" style="font-size:12px;color:var(--g)">Paid</span>
          </h2>

          <div class="tot">
            <span>Order ID</span>
            <b>${o.id}</b>
          </div>

          <div class="tot">
            <span>Paid</span>
            <span>${o.paid}</span>
          </div>

          <hr style="border-color:var(--b)">

          <div class="tot">
            <span>${a.cls} × ${o.items.length} tickets</span>
            <b>${o.sub.toLocaleString('de-DE')} ₫</b>
          </div>

          <div class="tot">
            <span>Service fee</span>
            <b>${o.fee.toLocaleString('de-DE')} ₫</b>
          </div>

          <div class="tot big">
            <span>Total</span>
            <span>${o.total.toLocaleString('de-DE')} ₫</span>
          </div>

          <div class="chip" style="background:#10224a">
            ✉ Order confirmation
            <b>${o.email}</b>
            <br>
            <small class="sub">
              Your order has been recorded successfully.
            </small>
          </div>
        </div>
      </div>

      <br>

      <a class="btn blue" href="#/tickets"
         style="display:inline-block;width:230px">My ticket</a>

      <a class="btn ghost" href="#/"
         style="display:inline-block;width:230px">Home</a>

      <p class="sub" style="margin-top:18px">
        Need help? <a class="lnk" href="#/help">Contact support</a>
      </p>
    </div>
  `;
}
