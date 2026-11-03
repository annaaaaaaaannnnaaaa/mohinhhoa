function login() {
  const role = SS.getItem('enc_role') || 'c', e = SS.getItem('enc_err') || '';
  SS.removeItem('enc_err');
  return `<div class="auth"><div class="art" style="background-image:url(assets/login.jpg)"></div><form id="lf"><h1>${t('login')}</h1>${role=='c'?`<p class="sub">${t('lsub')}</p>`:''}
<div class="seg"><button type="button" data-r="c" class="${role=='c'?'on':''}">${t('cus')}</button><button type="button" data-r="a" class="${role=='a'?'on':''}">${t('adm')}</button></div>
<label>${t('em')}</label><input class="in" name="e" value="${role=='c'?'nguoimua@gmail.com':'admin@concert.vn'}"><label>${t('pw')}</label><input class="in" name="p" type="password" value="${PASSWORD}">
<div class="rm"><span><input type="checkbox" checked> ${t('rem')}</span><a href="#" onclick="toast('Demo: password is ${PASSWORD}');return false">${t('fg')}</a></div><button class="btn" style="width:100%">${t('login')}</button>
${role=='c'?`<div class="or">${t('or')}</div><div class="soc"><button type="button" onclick="toast('Demo only')">Google</button><button type="button" onclick="toast('Demo only')">Apple</button></div>`:''}
${e?`<div class="err">⚠ ${e}</div>`:''}<p class="foot">${t('no')} <a class="lnk" href="#/signup">${t('su')}</a></p></form></div>`
}

function signup() {
  const e = SS.getItem('enc_err') || '';
  SS.removeItem('enc_err');
  return `<div class="auth"><div class="art" style="background-image:url(assets/crowd.jpg)"></div><form id="sf"><h1>${t('reg')}</h1><p class="sub">${t('rsub')}</p>
<label>${t('fn')}</label><input class="in" name="n" placeholder="Nguyễn Văn A"><label>Email</label><input class="in" name="e" placeholder="nguoimua@gmail.com"><label>${t('ph')}</label><input class="in" name="ph" placeholder="0901234567">
<label>${t('pw')}</label><input class="in" name="p" type="password"><label>${t('cp')}</label><input class="in" name="p2" type="password"><br><br><button class="btn" style="width:100%">${t('ca')}</button>
${e?`<div class="err">⚠ ${e}</div>`:''}<p class="foot">${t('has')} <a class="lnk" href="#/login">${t('li')}</a></p></form></div>`
}

function fail(m, su) {
  SS.setItem('enc_err', m);
  route()
}
