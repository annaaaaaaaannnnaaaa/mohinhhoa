const hdr = a => {
  const u = user();
  return `<header><a class="logo" href="#/"><i>◈</i>ENCORE</a><nav><a class="${a=='d'?'on':''}" href="#/">Discover</a><a class="${a=='t'?'on':''}" href="#/tickets">My Tickets</a><a class="${a=='h'?'on':''}" href="#/help">Help</a></nav>
<span><a class="acc" href="${u?'#/logout':'#/login'}">${u?u.name+' · Log out':'MY ACCOUNT'}</a> <a class="lnk" href="#" onclick="LS.setItem('enc_lang',LANG()=='en'?'vi':'en');route();return false" style="margin-left:12px;font-size:12px">EN/VI</a></span></header>`
};
