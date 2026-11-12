//  ADMIN – Settings
const ADS = {tab: 'General', draft: null};
const AD_STABS = ['General', 'Fyments', 'Ticketing rules', 'Notifications', 'Team and roles', 'Integrations'];

const adsDraft = () => ADS.draft || (ADS.draft = clone(adSettings()));

function adsRow(title, desc, ctrl) {
  return `<div class="sr"><div><b>${title}</b><small>${desc}</small></div>${ctrl}</div>`
}

function adsOrg(d) {
  const sel = (id, label, opts, cur) => `<div class="f s3"><label for="${id}">${label}</label><select class="ai" id="${id}">${opts.map(o => `<option ${o==cur?'selected':''}>${o}</option>`).join('')}</select></div>`;
  return `<div class="ad-card"><h3>Organization</h3><p class="mu s">Basic information shown on tickets and emails.</p><div class="fg tight">
<div class="f s3"><label for="so">Organization name</label><input class="ai" id="so" value="${adEsc(d.org)}"></div><div class="f s3"><label for="se">Support email</label><input class="ai" id="se" value="${adEsc(d.email)}"></div>
${sel('stz', 'Timezone', ['(GMT+7) Hanoi, Bangkok', '(GMT+8) Singapore', '(GMT+9) Seoul, Tokyo', '(GMT+0) London'], d.tz)}${sel('scu', 'Currency', ['VND (₫)', 'USD ($)', 'THB (฿)'], d.cur)}</div></div>`
}

function adsRules(d) {
  return `<div class="ad-card"><h3>Ticketing rules</h3><p class="mu s">Control how customers buy and enter.</p>
${adsRow('Virtual waiting room', 'Queue visitors when an on-sale opens to protect seat inventory.', adSwitch('sq', d.queue))}
${adsRow('Seat hold time', 'How long selected seats are reserved during checkout.', `<input class="ai box" id="sh" value="${adEsc(d.hold)}" aria-label="Seat hold time">`)}
${adsRow('Max tickets per order', 'Limit tickets a single customer can buy.', `<input class="ai box" id="sm" value="${adEsc(d.max)}" aria-label="Max tickets per order" inputmode="numeric">`)}
${adsRow('Require QR validation at gate', 'Only scanned and validated tickets are allowed to enter.', adSwitch('sr', d.qr))}</div>`
}

function adsPane(d) {
  const tab = ADS.tab;
  if (tab == 'General') return adsOrg(d)+adsRules(d);
  if (tab == 'Ticketing rules') return adsRules(d);
  if (tab == 'Payments') return `<div class="ad-card"><h3>Payment methods</h3><p class="mu s">Choose how customers can pay at checkout.</p>
${adsRow('Visa / Mastercard', 'Card payments through the demo gateway.', adSwitch('pv', d.pay.visa))}${adsRow('MoMo', 'E-wallet payments.', adSwitch('pm', d.pay.momo))}${adsRow('ZaloPay', 'E-wallet payments.', adSwitch('pz', d.pay.zalo))}${adsRow('VNPay QR', 'Bank QR payments.', adSwitch('pn', d.pay.vnpay))}</div>`;
  if (tab == 'Notifications') return `<div class="ad-card"><h3>Notifications</h3><p class="mu s">Choose which emails the system sends.</p>
${adsRow('Order confirmation', 'Email customers a receipt and e-tickets after payment.', adSwitch('no', d.notif.order))}${adsRow('Refund updates', 'Email customers when an order is refunded.', adSwitch('nr', d.notif.refund))}${adsRow('Daily sales summary', 'Email the admin team a summary every morning.', adSwitch('nd', d.notif.daily))}</div>`;
  if (tab == 'Team and roles') return `<div class="ad-card"><h3>Team and roles</h3><p class="mu s">People who can sign in to the admin area.</p>${ACCOUNTS.filter(a => a.role != 'Customer').map(a => adsRow(a.name, a.email, adPill(a.role == 'Administrator' ? 'Admin' : 'Checker').replace('p-admin', 'p-vip').replace('p-checker', 'p-upcoming'))).join('')}</div>`;
  return `<div class="ad-card"><h3>Integrations</h3><p class="mu s">Services connected to ENCORE.</p>
${adsRow('Payment gateway', 'Demo payment – no real money is charged.', adPill('Demo').replace('p-demo', 'p-upcoming'))}${adsRow('Email delivery', 'Order confirmations and support replies.', adPill('Not connected').replace('p-notconnected', 'p-ended'))}${adsRow('Ticket scanner', 'Venue gate scanners and handhelds.', adPill('Not connected').replace('p-notconnected', 'p-ended'))}</div>`
}

function adpSettings() {
  const d = adsDraft();
  return `<h1>Settings</h1><p class="sub">Manage your organization, payments and ticketing rules.</p>
<div class="sgrid"><div class="ad-card snav" id="sn">${AD_STABS.map(t => `<button type="button" data-t="${t}" class="${t==ADS.tab?'on':''}">${t}</button>`).join('')}</div>
<div><div class="col" id="sp">${adsPane(d)}</div><div class="btns r"><button type="button" class="ab" id="scn">Cancel</button><button type="button" class="ab pu" id="ssv">Save changes</button></div></div></div>`
}

function adsReadText() {
  const d = adsDraft(), v = id => $('#'+id) && $('#'+id).value.trim();
  if (v('so') != null && $('#so')) Object.assign(d, {org: v('so'), email: v('se'), tz: $('#stz').value, cur: $('#scu').value});
  if ($('#sh')) Object.assign(d, {hold: v('sh'), max: v('sm')})
}

function adsBindPane() {
  const d = adsDraft(), tg = (id, set) => {
    const b = $('#'+id);
    if (b) b.onclick = () => {
      const on = b.classList.contains('off');
      b.classList.toggle('off', !on);
      b.setAttribute('aria-pressed', on);
      set(on)
    }
  };
  tg('sq', v => d.queue = v);
  tg('sr', v => d.qr = v);
  tg('pv', v => d.pay.visa = v);
  tg('pm', v => d.pay.momo = v);
  tg('pz', v => d.pay.zalo = v);
  tg('pn', v => d.pay.vnpay = v);
  tg('no', v => d.notif.order = v);
  tg('nr', v => d.notif.refund = v);
  tg('nd', v => d.notif.daily = v)
}

function adbSettings() {
  document.querySelectorAll('#sn button').forEach(b => b.onclick = () => {
    adsReadText();
    ADS.tab = b.dataset.t;
    document.querySelectorAll('#sn button').forEach(x => x.classList.toggle('on', x == b));
    $('#sp').innerHTML = adsPane(adsDraft());
    adsBindPane()
  });
  $('#scn').onclick = () => {
    ADS.draft = null;
    $('#sp').innerHTML = adsPane(adsDraft());
    adsBindPane();
    toast('Changes discarded')
  };
  $('#ssv').onclick = () => {
    adsReadText();
    const d = adsDraft(), hold = parseInt(d.hold, 10), max = parseInt(d.max, 10);
    if ($('#se') && !/^\S+@\S+\.\S+$/.test(d.email)) return toast('Enter a valid support email');
    if ($('#sh')) {
      if (!(hold >= 1 && hold <= 60)) return toast('Seat hold time must be between 1 and 60 minutes');
      if (!(max >= 1 && max <= 20)) return toast('Max tickets per order must be between 1 and 20');
      d.hold = hold+' min';
      d.max = String(max);
      $('#sh').value = d.hold;
      $('#sm').value = d.max
    }
    adSave({settings: clone(d)});
    toast('Settings saved')
  };
  adsBindPane()
}
