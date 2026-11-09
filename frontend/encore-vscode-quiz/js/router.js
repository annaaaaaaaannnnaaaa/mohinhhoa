function route() {
  clearInterval(tmr);
  const h = location.hash.slice(2).split('/');
  const r = h[0] || 'home';
  const A = $('#app');
  const need = ['queue', 'seats', 'checkout', 'success', 'tickets'];
  if (r == 'logout') {
    LS.removeItem('enc_user');
    LS.removeItem('enc_token');
    SS.clear();
    return location.hash = '#/'
  }
  if (r == 'admin') return adRoute(h[1], h[2]);
  holdGuard();
  if (need.includes(r) && !user()) {
    SS.setItem('enc_next', location.hash);
    return location.hash = '#/login'
  }
  try {
    A.innerHTML = ({home, login, signup, queue, seats, checkout, success, tickets, help}[r] || home)(h[1], h[2]);
    window.scrollTo(0, 0);
    bind(r, h[1])
  } catch (e) {
    console.error(e);
    A.innerHTML = errPage(e)
  }
}

function bind(r, id) {
  if (r == 'home') {
    const go = () => {
      SS.setItem('enc_q', $('#q').value);
      route()
    };
    $('#sq').onclick = go;
    $('#q').onkeydown = e => {
      if (e.key == 'Enter') go()
    }
  }
  if (r == 'login') {
    document.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
      SS.setItem('enc_role', b.dataset.r); route()
    });
    $('#lf').onsubmit = async e => {
      e.preventDefault();
      const f = e.target;
      const role = SS.getItem('enc_role') || 'c';
      let u;
      try {
        u = await apiLogin(f.e.value.trim().toLowerCase(), f.p.value);
      } catch (err) {
        console.error('Login error:', err);
        return fail(err.message || t('bad'));
      }
      if (role == 'c' && u.role != 'Customer') return fail(t('bad'));
      if (role == 'a' && u.role == 'Customer') return fail(t('perm'));
      W(LS, 'enc_user', {email: u.email, name: u.name, role: u.role});
            if (u.role === 'Administrator') adLoadConcerts();
      if (u.role != 'Customer') return location.hash = u.role == 'Ticket Checker' ? '#/admin/checkin' : '#/admin';
      const n = SS.getItem('enc_next');
      SS.removeItem('enc_next');
      location.hash = n || '#/'
    }
  }
  if (r == 'signup')$('#sf').onsubmit = e => {
    e.preventDefault();
    const f = e.target;
    const em = f.e.value.trim().toLowerCase();
    if (!f.n.value.trim() || !/^\S+@\S+\.\S+$/.test(em) || !/^0\d{9}$/.test(f.ph.value.replace(/\s/g, '')) || !f.p.value) return fail(t('inv'), 1);
    if (f.p.value != f.p2.value) return fail(t('mis'), 1);
    if (allUsers().some(x => x.email == em)) return fail(t('dup'), 1);
    W(LS, 'enc_users', J(LS, 'enc_users', []).concat({email: em, name: f.n.value.trim(), phone: f.ph.value, role: 'Customer', pw: f.p.value}));
    toast('Account created');
    SS.setItem('enc_role', 'c');
    location.hash = '#/login'
  };
  if (r == 'queue') qrun(id);
  if (r == 'seats') stimer();
  if (r == 'checkout') ctimer(id);
  if (r == 'tickets') {
    const n = $('#nx');
    n && (n.onclick = () => {
      SS.setItem('enc_ti', (+SS.getItem('enc_ti') || 0)+1); route()
    })
  }
  const nz = $('#zoomin');
  if (nz) {
    nz.onclick = () => {
      sv.zoom = Math.min(1.8, sv.zoom+.2);
      drawMap()
    };
    $('#zoomout').onclick = () => {
      sv.zoom = Math.max(.7, sv.zoom-.2);
      drawMap()
    }
  }
}

addEventListener('hashchange', route);