const PI = Math.PI;

const rad = d => d*PI/180;

const ell = (cx, cy, a, b, c, d, a1, a2) => {
  const p = (rx, ry, g) => [cx+rx*Math.cos(rad(g)), cy+ry*Math.sin(rad(g))].map(v => v.toFixed(1)).join(' ');
  return `M${p(a,b,a1)}A${a} ${b} 0 0 1 ${p(a,b,a2)}L${p(c,d,a2)}A${c} ${d} 0 0 0 ${p(c,d,a1)}Z`
};

const fan = (cx, cy, r1, r2, a1, a2) => {
  const p = (r, g) => [cx+r*Math.sin(rad(g)), cy+r*Math.cos(rad(g))].map(v => v.toFixed(1)).join(' ');
  return `M${p(r2,a1)}A${r2} ${r2} 0 0 0 ${p(r2,a2)}L${p(r1,a2)}A${r1} ${r1} 0 0 1 ${p(r1,a1)}Z`
};

const isOut = (c, z) => c.out.includes(z.k);

function zoneEl(c, z, tag, attrs, lx, ly, sub = '') {
  const o = isOut(c, z), col = o ? '#2a3250' : c.classes[z.cls].c;
  return `<g class="z ${o?'out':''}" data-k="${z.k}"><${tag} ${attrs} fill="${col}" stroke="#0a0e17" stroke-width="3"/><text x="${lx}" y="${ly}" text-anchor="middle" font-size="${c.map=='ring'?14:15}" font-weight="700" fill="${o?'#6b7691':'#10131c'}">${o?'Sold':z.label}</text>${sub&&!o?`<text x="${lx}" y="${ly+17}" text-anchor="middle" font-size="12" font-weight="700" fill="#10131c">${sub}</text>`:''}</g>`
}

function overview(c) {
  const Zs = k => c.zones.find(z => z.k == k);
  if (c.map == 'ring') {
    let s = '<svg viewBox="0 0 1000 500"><g>', cx = 500, cy = 250;
    c.zones.forEach(z => {
      const n = +z.k, inner = n < 200, i = (n%100)-1, span = inner ? 30 : 22.5, mid = (inner ? 15 : 11.25)+span*i, a1 = mid-span/2+.8, a2 = mid+span/2-.8, R = inner ? [300, 150, 230, 85] : [392, 235, 318, 165], rm = (R[0]+R[2])/2, rym = (R[1]+R[3])/2;
      s += zoneEl(c, z, 'path', `d="${ell(cx,cy,...R,a1,a2)}"`, cx+rm*Math.cos(rad(mid)), cy+rym*Math.sin(rad(mid))+4)
    });
    return s+`<g stroke="#7553f7" stroke-width="22" stroke-linecap="round" pointer-events="none"><line x1="400" y1="170" x2="600" y2="330"/><line x1="600" y1="170" x2="400" y2="330"/></g><circle cx="500" cy="250" r="34" fill="#7553f7"/><text x="500" y="254" text-anchor="middle" font-size="12" font-weight="800">STAGE</text></g></svg>`
  }
  if (c.map == 'fan') {
    let s = '<svg viewBox="0 0 700 410"><rect x="255" y="8" width="190" height="46" fill="#24523a"/><text x="350" y="37" text-anchor="middle" font-weight="700">Stage</text>', cx = 350, cy = 62;
    const ring = (ks, r1, r2, A) => ks.forEach((k, i) => {
      const z = Zs(k), w = 2*A/ks.length, a1 = -A+w*i+1, a2 = -A+w*(i+1)-1, m = rad((a1+a2)/2), r = (r1+r2)/2;
      s += zoneEl(c, z, 'path', `d="${fan(cx,cy,r1,r2,a1,a2)}"`, cx+r*Math.sin(m), cy+r*Math.cos(m)+4)
    });
    ring(['VIP'], 62, 120, 48);
    ring(['1C', '1B', '1A'], 125, 185, 60);
    ring(['2E', '2D', '2C', '2B', '2A'], 190, 250, 66);
    ring(['3G', '3F', '3E', '3D', '3C', '3B', '3A'], 255, 320, 72);
    return s+'</svg>'
  }
  const B = (k, x, y, w, h, sub) => zoneEl(c, Zs(k), 'rect', `x="${x}" y="${y}" width="${w}" height="${h}" rx="9"`, x+w/2, y+h/2, sub ? money(c.classes[Zs(k).cls].p) : '');
  return `<svg viewBox="0 0 700 430"><rect x="240" y="8" width="220" height="50" fill="#850505"/><text x="350" y="40" text-anchor="middle" font-size="22" font-weight="800">STAGE</text><text x="30" y="82" font-size="10" font-weight="700" fill="#9aa6bd">TẦNG 1 · TẦNG TRỆT</text>
 ${B('VL',30,92,150,44)+B('VC',190,92,320,44,1)+B('VR',520,92,150,44)+B('1L',28,144,152,102)+B('1C',186,144,328,102,1)+B('1R',520,144,152,102)}
 <line x1="30" x2="670" y1="262" y2="262" stroke="#2a3250" stroke-dasharray="4"/><rect x="265" y="252" width="170" height="20" rx="10" fill="#1b2437"/><text x="350" y="266" text-anchor="middle" font-size="10" font-weight="700">↑ TẦNG 2 · BAN CÔNG ↑</text>
 ${B('2L',30,284,150,62)+B('2C',190,284,320,62,1)+B('2R',520,284,150,62)+B('3L',30,354,150,70)+B('3C',190,354,320,70,1)+B('3R',520,354,150,70)}</svg>`
}

const ROWS = 'ABCDEFGHIJ';

function st(c, z, id) {
  const k = z.k+'-'+id;
  if (isOut(c, z) || (c.ex[z.k]?.S || []).includes(id) || soldLocal().includes(c.id+'|'+k)) return 'S';
  if ((c.ex[z.k]?.H || []).includes(id)) return 'H';
  return sel().items.some(i => i.key == k) ? 'X' : 'A'
}

function detail(c, z) {
  const col = c.classes[z.cls].c, cv = c.map == 'hall' ? 0 : 1.5, cols = 10, h = z.rows*46+50;
  let s = `<svg viewBox="0 0 640 ${h}">`;
  for (let r = 0; r < z.rows; r++) {
    const L = ROWS[r], y0 = 36+r*46;
    s += `<text x="26" y="${y0+5}" fill="#9aa6bd" font-weight="700">${L}</text><text x="614" y="${y0+5}" fill="#9aa6bd" font-weight="700" text-anchor="end">${L}</text>`;
    for (let i = 0; i < cols; i++) {
      const n = i+1, id = L+pad(n), S = st(c, z, id), x = 80+i*53, y = y0+Math.pow(i-4.5, 2)*cv;
      s += `<g class="z ${S=='A'||S=='X'?'':'out'}" data-s="${id}"><circle cx="${x}" cy="${y}" r="16" fill="${S=='S'?'#2a3250':S=='X'?'#fff':S=='H'?'none':col}" ${S=='H'?'stroke="#9aa6bd" stroke-dasharray="3"':S=='X'?'stroke="#7553f7" stroke-width="4"':''}/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" font-weight="700" fill="${S=='X'?'#7553f7':S=='A'?'#10131c':'#6b7691'}">${S=='X'?'✓':n}</text></g>`
    }
  }
  return s+'</svg>'
}

function legend(c) {
  const v = c.vn;
  return `<div class="leg">${Object.entries(c.classes).map(([k,o])=>`<span><i style="background:${o.c}"></i>${k} ${money(o.p)}</span>`).join('')}</div><div class="leg"><span><i style="background:#2a3250"></i>${v?'Đã bán':'Sold'}</span><span><i style="border:2px dashed #9aa6bd"></i>${v?'Đang được giữ':'Reserved'}</span><span><i style="background:#fff;border:3px solid #7553f7"></i>${v?'Bạn chọn':'Selecting'}</span></div>`
}
