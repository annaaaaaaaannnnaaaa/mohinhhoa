//  ADMIN – Concert management  +  Create concert

const ADC = {f: 'All', q: '', page: 1, sel: null, draft: null};
const AD_CPER = 5;
const clone = o => JSON.parse(JSON.stringify(o));
const num = v => +String(v).replace(/\D/g, '') || 0;

function adcFiltered() {
  const q = ADC.q.trim().toLowerCase();
  return adConcertList().filter(c => (ADC.f == 'All' || c.status == ADC.f) && (!q || (c.title+c.venue).toLowerCase().includes(q)))
}

function adcSel() {
  const l = adConcertList();
  return l.find(c => c.id == ADC.sel) || l[0]
}

function adcDraft() {
  const c = adcSel();
  if (!ADC.draft || ADC.draft.id != c.id) ADC.draft = clone(c);
  return ADC.draft
}

function adcTable() {
  const list = adcFiltered(), pages = Math.max(1, Math.ceil(list.length/AD_CPER));
  if (ADC.page > pages) ADC.page = 1;
  const rows = list.slice((ADC.page-1)*AD_CPER, ADC.page*AD_CPER), sel = adcSel().id;
  return `<div class="ad-t cn"><div class="th"><span>EVENT</span><span>DATE</span><span>TICKETS SOLD</span><span>STATUS</span></div>
${rows.map(c => `<div class="tr cr ${c.id==sel?'sel':''}" data-id="${c.id}" tabindex="0"><div class="evn"><i class="th2" style="background:linear-gradient(135deg,${c.g[0]},${c.g[1]})"></i><div><b>${adEsc(c.title)}</b><small>${adEsc(c.venue)}</small></div></div>
<div><b>${c.date}</b><small>${c.time}</small></div><div><b>${adNum(c.sold)} / ${adNum(c.total)}</b><div class="bar3"><i style="width:${Math.max(c.sold ? 4 : 2, Math.min(100, c.sold/c.total*100))}%"></i></div></div><div>${adPill(c.status)}</div></div>`).join('') || '<div class="empty">No concerts match this filter.</div>'}
<div class="tf"><span class="mu">Showing ${rows.length} of ${list.length} concerts</span>${adPager(ADC.page, pages)}</div></div>`
}

function adcEdit() {
  const d = adcDraft();
  return `<h3>Edit ticket categories</h3><p class="mu s">${adEsc(d.title)}</p>
<div class="ad-t ed"><div class="th"><span>CATEGORY</span><span>PRICE (VND)</span><span>SEATS</span></div>
${d.cats.map((c, i) => `<div class="tr"><span class="cat"><i class="dot" style="background:${c[1]}"></i><b>${adEsc(c[0])}</b></span><input class="ai" data-pr="${i}" inputmode="numeric" aria-label="${adEsc(c[0])} price" value="${adNum(c[2])}"><input class="ai" data-st="${i}" inputmode="numeric" aria-label="${adEsc(c[0])} seats" value="${adNum(c[3])}"></div>`).join('')}</div>
<div class="tg"><div><b>Allow seat selection</b><small>Customers pick exact seats</small></div>${adSwitch('t1', d.seatSel)}</div>
<div class="tg"><div><b>Virtual waiting room</b><small>Queue visitors at on-sale time</small></div>${adSwitch('t2', d.queue)}</div>
<div class="btns"><button type="button" class="ab" id="dis">Discard</button><button type="button" class="ab pu" id="sav">Save changes</button></div>`
}

function adpConcerts() {
  return `<div class="ad-top"><div><h1>Concert management</h1><p class="sub">Create, edit and monitor concerts and seat availability.</p></div><div class="acts"><a class="ab pu" href="#/admin/concerts/new">+ New concert</a></div></div>
<div class="filters sp"><div class="pills" id="cf">${['All', 'On sale', 'Upcoming', 'Draft', 'Ended'].map(x => `<button type="button" data-f="${x}" class="${x==ADC.f?'on':''}">${x}</button>`).join('')}</div><input class="ai" id="cq" placeholder="Search concerts…" value="${adEsc(ADC.q)}" style="width:290px"></div>
<div class="grid21 st"><div class="ad-card tbl" id="ct">${adcTable()}</div><div class="ad-card edit" id="ce">${adcEdit()}</div></div>`
}

function adBindConcertTable() {
  document.querySelectorAll('#ct .cr').forEach(r => {
    const go = () => {
      ADC.sel = r.dataset.id;
      ADC.draft = null;
      $('#ct').innerHTML = adcTable();
      $('#ce').innerHTML = adcEdit();
      adBindConcertTable();
      adBindConcertEdit()
    };
    r.onclick = go;
    r.onkeydown = e => {
      if (e.key == 'Enter' || e.key == ' ') {
        e.preventDefault();
        go()
      }
    }
  });
  document.querySelectorAll('#ct [data-p]').forEach(b => b.onclick = () => {
    ADC.page = +b.dataset.p;
    $('#ct').innerHTML = adcTable();
    adBindConcertTable()
  })
}

function adBindConcertEdit() {
  const d = adcDraft();
  document.querySelectorAll('#ce [data-pr]').forEach(i => {
    i.oninput = () => d.cats[+i.dataset.pr][2] = num(i.value);
    i.onblur = () => i.value = adNum(d.cats[+i.dataset.pr][2])
  });
  document.querySelectorAll('#ce [data-st]').forEach(i => {
    i.oninput = () => d.cats[+i.dataset.st][3] = num(i.value);
    i.onblur = () => i.value = adNum(d.cats[+i.dataset.st][3])
  });
  [['t1', 'seatSel'], ['t2', 'queue']].forEach(([id, k]) => $('#'+id).onclick = e => {
    d[k] = !d[k];
    e.currentTarget.classList.toggle('off', !d[k]);
    e.currentTarget.setAttribute('aria-pressed', d[k])
  });
  $('#dis').onclick = () => {
    ADC.draft = null;
    $('#ce').innerHTML = adcEdit();
    adBindConcertEdit();
    toast('Changes discarded')
  };
  $('#sav').onclick = () => {
    const l = adConcertList(), i = l.findIndex(c => c.id == d.id);
    l[i] = clone(d);
    adSave({concerts: l});
    toast('Changes saved')
  }
}

function adbConcerts() {
  document.querySelectorAll('#cf button').forEach(b => b.onclick = () => {
    ADC.f = b.dataset.f;
    ADC.page = 1;
    document.querySelectorAll('#cf button').forEach(x => x.classList.toggle('on', x == b));
    $('#ct').innerHTML = adcTable();
    adBindConcertTable()
  });
  $('#cq').oninput = e => {
    ADC.q = e.target.value;
    ADC.page = 1;
    $('#ct').innerHTML = adcTable();
    adBindConcertTable()
  };
  adBindConcertTable();
  adBindConcertEdit()
}

//  Create concert  (#/admin/concerts/new)
const ADN0 = () => ({title: 'BIGBANG 2026–2027 WORLD TOUR < XX : COSMOS >', artist: 'BIGBANG', genre: 'K-pop', date: 'Feb 18, 2026', start: '19:30', doors: '17:30', venue: 'Mỹ Đình Stadium', city: 'Hà Nội, Việt Nam', tpl: 'stadium',
  cats: [['VIP', AD_COL.pu, 6500000, 500], ['CAT 1', AD_COL.pk, 4300000, 1000], ['CAT 2', AD_COL.tl, 3400000, 1000], ['CAT 3', AD_COL.or, 2200000, 1000]], onDate: 'Oct 25, 2026', onTime: '10:00', poster: null});
let ADN = ADN0();

const AD_TPL = {
  arena: ['Arena', 'Ring sections around the stage', '5,200 seats · 4 tiers', `<svg viewBox="0 0 110 62"><rect x="35" y="2" width="40" height="8" rx="3" fill="#3b2f7a"/><path d="M12 14A43 43 0 0 0 98 14" fill="none" stroke="#f5a623" stroke-width="7" stroke-linecap="round"/><path d="M24 14A31 31 0 0 0 86 14" fill="none" stroke="#2eccb0" stroke-width="7" stroke-linecap="round"/><path d="M36 14A19 19 0 0 0 74 14" fill="none" stroke="#ff5c77" stroke-width="7" stroke-linecap="round"/></svg>`],
  stadium: ['Stadium', 'Floor zones plus 2 stand tiers', '48,000 seats · 6 zones', `<svg viewBox="0 0 110 62"><ellipse cx="55" cy="31" rx="44" ry="26" fill="none" stroke="#f5a623" stroke-width="7"/><ellipse cx="55" cy="31" rx="32" ry="17" fill="none" stroke="#ff5c77" stroke-width="6"/><rect x="42" y="26" width="26" height="10" rx="4" fill="#7553f7"/></svg>`],
  theater: ['Theater', 'Orchestra plus balcony', '900 seats · 2 tiers', `<svg viewBox="0 0 110 62"><rect x="38" y="2" width="34" height="6" rx="3" fill="#3b2f7a"/><rect x="8" y="16" width="28" height="9" rx="3" fill="#7553f7"/><rect x="41" y="16" width="28" height="9" rx="3" fill="#ff5c77"/><rect x="74" y="16" width="28" height="9" rx="3" fill="#ff5c77"/><line x1="6" x2="104" y1="33" y2="33" stroke="#3a4468" stroke-dasharray="3 3"/><rect x="8" y="41" width="28" height="9" rx="3" fill="#2eccb0"/><rect x="41" y="41" width="28" height="9" rx="3" fill="#2eccb0"/><rect x="74" y="41" width="28" height="9" rx="3" fill="#f5a623"/></svg>`],
};

const adnTotal = () => ADN.cats.reduce((a, c) => a+c[3], 0);

function adnCats() {
  return `<div class="ad-t nc"><div class="th"><span>CATEGORY</span><span>PRICE (VND)</span><span>SEATS</span></div>${ADN.cats.map((c, i) => `<div class="tr"><span class="cat"><i class="dot" style="background:${c[1]}"></i><b>${adEsc(c[0])}</b></span><input class="plain" data-np="${i}" inputmode="numeric" aria-label="${adEsc(c[0])} price" value="${adNum(c[2])}"><input class="plain mu" data-ns="${i}" inputmode="numeric" aria-label="${adEsc(c[0])} seats" value="${adNum(c[3])}"></div>`).join('')}</div>`
}

function adpNew() {
  const f = (id, label, v, span = 2, ph = '') => `<div class="f s${span}"><label for="${id}">${label}</label><input class="ai" id="${id}" value="${adEsc(v)}" placeholder="${ph}"></div>`;
  const genres = ['K-pop', 'V-pop', 'Pop', 'Rock', 'EDM', 'Hip-hop', 'Jazz', 'Classical'];
  return `<div class="crumb"><a href="#/admin/concerts">Concerts</a> <span>/ New concert</span></div>
<div class="ad-top tight"><div><div class="ttl"><h1>Create concert</h1><span class="pill p-draft sm">Draft</span></div><p class="sub">Set up event details, venue, ticket categories and sale schedule.</p></div><div class="acts"><button type="button" class="ab" id="nd">Save draft</button><button type="button" class="ab pu" id="np">Publish concert</button></div></div>
<div class="grid21 st lg"><div class="col"><div class="ad-card"><h3>Event details</h3><div class="fg">
<div class="f s6"><label for="nt">Concert title</label><input class="ai b" id="nt" value="${adEsc(ADN.title)}"></div>
${f('na', 'Artist / performer', ADN.artist, 3)}<div class="f s3"><label for="ng">Genre</label><select class="ai" id="ng">${genres.map(g => `<option ${g==ADN.genre?'selected':''}>${g}</option>`).join('')}</select></div>
${f('nde', 'Event date', ADN.date, 2, 'e.g. Feb 18, 2026')}${f('ns', 'Start time', ADN.start, 2, 'HH:MM')}${f('nr', 'Doors open', ADN.doors, 2, 'HH:MM')}</div></div>
<div class="ad-card"><h3>Venue and seat map</h3><div class="fg">${f('nv', 'Venue name', ADN.venue, 3)}${f('nc', 'City', ADN.city, 3)}</div>
<label class="lb">Seat map template</label><div class="tpls" id="tp">${Object.entries(AD_TPL).map(([k, t]) => `<button type="button" class="tpl ${k==ADN.tpl?'on':''}" data-t="${k}" aria-pressed="${k==ADN.tpl}"><span class="ck">✓</span>${t[3]}<b>${t[0]}</b><small>${t[1]}</small><em>${t[2]}</em></button>`).join('')}</div></div></div>
<div class="col"><div class="ad-card"><h3>Poster</h3><label class="drop" id="drop" ${ADN.poster ? `style="background-image:url(${ADN.poster})"` : ''}><input type="file" id="pf" accept="image/png,image/jpeg" hidden><span class="up">↑</span><b>Upload poster</b><small>JPG or PNG · 1600×900 · max 5 MB</small></label></div>
<div class="ad-card"><div class="chd"><h3>Ticket categories</h3><a class="lk" href="#" id="ac">+ Add category</a></div><p class="mu s" id="tot">${adNum(adnTotal())} seats in total</p><div id="nct">${adnCats()}</div></div>
<div class="ad-card"><h3>Sale schedule</h3><div class="fg">${f('no', 'On-sale date', ADN.onDate, 3, 'e.g. Oct 25, 2026')}${f('nm', 'On-sale time', ADN.onTime, 3, 'HH:MM')}</div></div></div></div>`
}

function adnRead() {
  const v = id => $('#'+id).value.trim();
  Object.assign(ADN, {title: v('nt'), artist: v('na'), genre: v('ng'), date: v('nde'), start: v('ns'), doors: v('nr'), venue: v('nv'), city: v('nc'), onDate: v('no'), onTime: v('nm')})
}

function adnSubmit(draft) {
  adnRead();
  const t = /^\d{1,2}:\d{2}$/;
  const bad = (id, m) => {
    $('#'+id).focus();
    $('#'+id).classList.add('bad');
    toast(m);
    return true
  };
  document.querySelectorAll('.ai.bad').forEach(x => x.classList.remove('bad'));
  if (!ADN.title) return bad('nt', 'Enter a concert title');
  if (isNaN(new Date(ADN.date))) return bad('nde', 'Enter a valid event date, e.g. Feb 18, 2026');
  if (!t.test(ADN.start)) return bad('ns', 'Enter start time as HH:MM');
  if (!draft) {
    if (!ADN.venue) return bad('nv', 'Enter a venue name');
    if (isNaN(new Date(ADN.onDate))) return bad('no', 'Enter a valid on-sale date, e.g. Oct 25, 2026');
    if (ADN.cats.some(c => !c[2] || !c[3])) return toast('Every category needs a price and seat count')
  }
  const d = new Date(ADN.date), grads = [['#8b5cf6', '#c026d3'], ['#ff5c77', '#ff7a1a'], ['#2eccb0', '#3b82f6'], ['#f5a623', '#ff5c77']], l = adConcertList();
  l.unshift({id: 'c'+Date.now(), key: '', title: ADN.title, venue: ADN.venue+' · '+ADN.city.split(',')[0], date: pad(d.getDate())+' '+MONTHS[d.getMonth()]+' '+d.getFullYear(), time: ADN.start, sold: 0, total: adnTotal(),
    status: draft ? 'Draft' : 'Upcoming', g: grads[l.length % grads.length], cats: clone(ADN.cats), seatSel: true, queue: true});
  adSave({concerts: l});
  ADN = ADN0();
  ADC.sel = l[0].id;
  ADC.draft = null;
  ADC.f = 'All';
  ADC.q = '';
  ADC.page = 1;
  toast(draft ? 'Draft saved' : 'Concert published');
  location.hash = '#/admin/concerts'
}

function adbNew() {
  document.querySelectorAll('#tp .tpl').forEach(b => b.onclick = () => {
    ADN.tpl = b.dataset.t;
    document.querySelectorAll('#tp .tpl').forEach(x => {
      x.classList.toggle('on', x == b);
      x.setAttribute('aria-pressed', x == b)
    })
  });
  const bindCats = () => {
    document.querySelectorAll('[data-np]').forEach(i => {
      i.oninput = () => ADN.cats[+i.dataset.np][2] = num(i.value);
      i.onblur = () => i.value = adNum(ADN.cats[+i.dataset.np][2])
    });
    document.querySelectorAll('[data-ns]').forEach(i => {
      i.oninput = () => {
        ADN.cats[+i.dataset.ns][3] = num(i.value);
        $('#tot').textContent = adNum(adnTotal())+' seats in total'
      };
      i.onblur = () => i.value = adNum(ADN.cats[+i.dataset.ns][3])
    })
  };
  bindCats();
  $('#ac').onclick = e => {
    e.preventDefault();
    adnRead();
    const pal = ['#38bdf8', '#a3e635', '#f472b6', '#facc15'], n = ADN.cats.length;
    ADN.cats.push(['CAT '+n, pal[(n-4) % pal.length] || '#38bdf8', 1000000, 500]);
    $('#nct').innerHTML = adnCats();
    $('#tot').textContent = adNum(adnTotal())+' seats in total';
    bindCats()
  };
  $('#pf').onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg)$/.test(f.type)) return toast('Poster must be a JPG or PNG image');
    if (f.size > 5*1024*1024) return toast('Poster must be 5 MB or smaller');
    const r = new FileReader();
    r.onload = () => {
      ADN.poster = r.result;
      $('#drop').style.backgroundImage = 'url('+r.result+')';
      toast('Poster selected')
    };
    r.readAsDataURL(f)
  };
  $('#nd').onclick = () => adnSubmit(true);
  $('#np').onclick = () => adnSubmit(false)
}
