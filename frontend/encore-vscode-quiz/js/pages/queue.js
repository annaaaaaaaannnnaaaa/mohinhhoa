// Câu hỏi xác minh: mỗi lần vào trang (hoặc trả lời sai) sẽ ra một phép tính ngẫu nhiên khác
// Muốn thêm/bớt dạng phép tính → sửa mảng QUIZ_TYPES bên dưới.
let QZ = {q: '', a: 0};
const rnd = (a, b) => a+Math.floor(Math.random()*(b-a+1));
const QUIZ_TYPES = [
  () => { const a = rnd(100, 999), b = rnd(100, 999); return {q: a+' + '+b, a: a+b} },             // cộng
  () => { const a = rnd(200, 999), b = rnd(50, a-1); return {q: a+' - '+b, a: a-b} },              // trừ
  () => { const a = rnd(12, 199), b = rnd(3, 9); return {q: a+' x '+b, a: a*b} },                  // nhân
  () => { const b = rnd(3, 9), c = rnd(11, 99); return {q: (b*c)+' ÷ '+b, a: c} },                 // chia
  () => { const a = rnd(10, 99), b = rnd(2, 9), c = rnd(2, 9); return {q: a+' + '+b+' x '+c, a: a+b*c} },   // cộng + nhân
  () => { const a = rnd(10, 60), b = rnd(2, 9), c = rnd(5, 40); return {q: '('+a+' + '+c+') x '+b, a: (a+c)*b} },  // ngoặc
];
const newQuiz = () => QZ = QUIZ_TYPES[rnd(0, QUIZ_TYPES.length-1)]();

function queue(id) {
  const c = cc(id);
  newQuiz();
  return hdr('d')+`<div class="wrap queue"><h2>${c.title}</h2><p class="sub">Verification &amp; virtual queue</p><div class="panel" id="qb">
<h3>01 Verify you are human</h3><p class="sub">Solve the question before entering the queue.</p><p id="qq" style="font-size:22px;margin:16px">What is ${QZ.q} ?</p><input class="in" id="ans" placeholder="Your answer" style="max-width:240px;text-align:center"><br><br><button class="btn" id="vf">Verify &amp; join queue</button><p class="ok" id="vm"></p></div></div>`
}

function qrun(id) {
  if (SS.getItem('enc_q_'+id)) return location.hash = '#/seats/'+id;
  $('#ans').onkeydown = e => {
    if (e.key == 'Enter') $('#vf').click()
  };
  $('#vf').onclick = () => {
    if ($('#ans').value.trim() != String(QZ.a)) {
      newQuiz();
      $('#qq').textContent = 'What is '+QZ.q+' ?';
      $('#ans').value = '';
      $('#ans').focus();
      return toast('Wrong answer – here is a new question')
    }
    $('#vm').textContent = 'Verification complete ✓';
    let n = 7;
    $('#qb').innerHTML = `<h3>02 Your waiting room</h3><p class="sub">YOU ARE NUMBER</p><div class="qn" id="qn">${n}</div><p>IN THE QUEUE</p><p class="sub">Please keep this page open. You will enter when it is your turn.</p><span class="chip">IN QUEUE</span><p class="ok">Queue numbers are assigned by the server.</p>`;
    tmr = setInterval(() => {
      n--; if(n < 1) {
        clearInterval(tmr); SS.setItem('enc_q_'+id, 1); return location.hash = '#/seats/'+id
      }$('#qn').textContent = n
    }, 700)
  }
}
