const user = () => J(LS, 'enc_user', null);

const allUsers = () => ACCOUNTS.map(a => ({...a, pw: PASSWORD})).concat(J(LS, 'enc_users', []));

const orders = () => J(LS, 'enc_orders', []);

const soldLocal = () => J(LS, 'enc_sold', []);

const cc = id => CONCERTS.find(c => c.id === id);

let sel = () => J(SS, 'enc_sel', {cid: null, items: [], end: 0});

let tmr = null;

let sv = {zone: null, zoom: 1};
