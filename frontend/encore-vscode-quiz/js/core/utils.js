
const $ = s => document.querySelector(s);

const LS = localStorage;

const SS = sessionStorage;

const J = (s, k, d) => {
  try {
    return JSON.parse(s.getItem(k)) ?? d
  } catch (e) {
    return d
  }
};

const W = (s, k, v) => s.setItem(k, JSON.stringify(v));

const pad = n => String(n).padStart(2, '0');

const mmss = s => pad(Math.floor(s/60))+':'+pad(s%60);

const money = n => n.toLocaleString('de-DE')+'đ';

const fmtDate = d => {
  const x = new Date(d+'T00:00');
  return String(x.getDate()).padStart(2, '0')+' '+MONTHS[x.getMonth()]+' '+x.getFullYear()
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const range = (r, a, b) => {
  let o = [];
  for (let i = a; i <= b; i++) o.push(r+String(i).padStart(2, '0'));
  return o
};

function toast(m) {
  const e = $('#toast');
  e.textContent = m;
  e.className = 'on';
  clearTimeout(toast.h);
  toast.h = setTimeout(() => e.className = '', 2600)
}
