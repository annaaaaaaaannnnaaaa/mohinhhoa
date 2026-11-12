const Z = (k, cls, label, rows) => ({ k, cls, label, rows });

const CONCERTS = [
  // 1) ARIRANG WORLD TOUR – BTS  | seat map: vòng elip (ring)
  {
    id: 'arirang',
    code: 'CON01',
    title: 'ARIRANG WORLD TOUR 2026',
    card: 'ARIRANG WORLD TOUR - BTS',     
    tag: 'ARIRANG',                     
    artist: 'BTS',
    city: 'Bangkok, Thailand',
    venue: 'Rajamangala Stadium',
    addr: 'Bangkok, Thailand',
    date: '2026-12-05',
    time: '19:00',
    doors: '17:30',
    poster: 'assets/arirang.jpg',
    map: 'ring',
    fee: 25000,                           
    from: '3.000.000',                    
    vn: false,                             
    classes: {
      VIP: { p: 5300000, c: '#ff5c77' },
      GA:  { p: 4500000, c: '#2eccb0' },
      CAT: { p: 3000000, c: '#f5a623' },
    },
    zones: [
      ...[101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112].map(n => Z('' + n, 'VIP', '' + n, 10)),
      ...[201, 202, 207, 208, 209, 210, 215, 216].map(n => Z('' + n, 'GA', '' + n, 10)),
      ...[203, 204, 205, 206, 211, 212, 213, 214].map(n => Z('' + n, 'CAT', '' + n, 10)),
    ],
    ex: {
      '101': { S: range('A', 1, 2) },
      '102': { H: ['H02', 'H03'] },
      '103': { S: range('B', 3, 6) },
      '201': { S: range('B', 5, 8) },
      '202': { S: range('E', 7, 8) },
      '207': { S: ['D04'] },
      '203': { S: range('C', 1, 3) },
      '211': { H: ['G03', 'G04'] },
    },
    out: ['107', '109', '110', '204', '212', '213'],   
  },

  // 2) SKYNOTE – Quốc Thiên  | seat map: hình quạt (fan)
  {
    id: 'skynote',
    code: 'CON02',
    title: 'SKYNOTE - Quốc Thiên',
    card: 'SKYNOTE - Quốc Thiên',
    tag: 'SKYNOTE',
    artist: 'Quốc Thiên',
    city: 'Hà Nội',
    venue: 'VEC Hà Nội',
    addr: 'VEC - Đông Anh, Hà Nội',
    date: '2026-11-22',
    time: '19:30',
    doors: '18:30',
    poster: 'assets/skynote.jpg',
    map: 'fan',
    fee: 25000,
    from: '1.200.000',
    vn: false,
    classes: {
      'VIP':   { p: 3000000, c: '#7b51fc' },
      'CAT 1': { p: 2300000, c: '#ff5c77' },
      'CAT 2': { p: 1700000, c: '#2eccb0' },
      'CAT 3': { p: 1200000, c: '#f5a623' },
    },
    zones: [
      Z('VIP', 'VIP', 'VIP', 10),
      ...'ABC'.split('').map(l => Z('1' + l, 'CAT 1', 'CAT 1 · ' + l, 7)),
      ...'ABCDE'.split('').map(l => Z('2' + l, 'CAT 2', 'CAT 2 · ' + l, 7)),
      ...'ABCDEFG'.split('').map(l => Z('3' + l, 'CAT 3', 'CAT 3 · ' + l, 7)),
    ],
    ex: {
      'VIP': { S: ['A04', 'A05'] },
      '1A':  { S: range('B', 1, 3) },
      '2A':  { H: ['D05', 'D06'] },
      '3A':  { S: ['C05', 'C06'] },
    },
    out: ['2E', '3G', '3A'],
  },

  // 3) SKETCH A ROSE – Hà Anh Tuấn  | seat map: khối Tầng 1 / Tầng 2 (hall)
  {
    id: 'sketch',
    code: 'CON03',
    title: 'SKETCH A ROSE - Hà Anh Tuấn',
    card: 'SKETCH A ROSE-HÀ ANH TUẤN',
    tag: 'SKETCH A ROSE',
    artist: 'Hà Anh Tuấn',
    city: 'Hồ Chí Minh',
    venue: 'The Global City',
    addr: 'The Global City, Hồ Chí Minh',
    date: '2027-01-05',
    time: '20:00',
    doors: '17:30',
    poster: 'assets/sketch.jpg',
    map: 'hall',
    fee: 25000,
    from: '1.200.000',
    vn: true,
    classes: {
      'VIP':   { p: 3500000, c: '#7b51fc' },
      'CAT 1': { p: 2500000, c: '#ff5c77' },
      'CAT 2': { p: 1800000, c: '#2eccb0' },
      'CAT 3': { p: 1200000, c: '#f5a623' },
    },
    zones: [
      Z('VL', 'VIP', 'VIP · Left', 3),
      Z('VC', 'VIP', 'VIP · Central', 3),
      Z('VR', 'VIP', 'VIP · Right', 3),
      Z('1L', 'CAT 1', 'CAT 1 · Left', 10),
      Z('1C', 'CAT 1', 'CAT 1 · Central', 10),
      Z('1R', 'CAT 1', 'CAT 1 · Right', 10),
      Z('2L', 'CAT 2', 'CAT 2 · Left', 5),
      Z('2C', 'CAT 2', 'CAT 2 · Central', 5),
      Z('2R', 'CAT 2', 'CAT 2 · Right', 5),
      Z('3L', 'CAT 3', 'CAT 3 · Left', 7),
      Z('3C', 'CAT 3', 'CAT 3 · Central', 7),
      Z('3R', 'CAT 3', 'CAT 3 · Right', 7),
    ],
    ex: {},
    out: ['3R'],
  },
];
// Map UI zone IDs to actual database ZoneIDs
const DB_ZONE_MAP = {
  arirang: {
    '101': 'Z1', '102': 'Z2', '103': 'Z3', '104': 'Z4',
    '105': 'Z5', '106': 'Z6', '107': 'Z7', '108': 'Z8',
    '109': 'Z9', '110': 'Z10', '111': 'Z11', '112': 'Z12',
    '201': 'Z13', '202': 'Z14', '207': 'Z15', '208': 'Z16',
    '209': 'Z17', '210': 'Z18', '215': 'Z19', '216': 'Z20',
    '203': 'Z21', '204': 'Z22', '205': 'Z23', '206': 'Z24',
    '211': 'Z25', '212': 'Z26', '213': 'Z27', '214': 'Z28'
  },

  skynote: {
    'VIP': 'Z29',
    '1A': 'Z30', '1B': 'Z31', '1C': 'Z32',
    '2A': 'Z33', '2B': 'Z34', '2C': 'Z35',
    '2D': 'Z36', '2E': 'Z37',
    '3A': 'Z38', '3B': 'Z39', '3C': 'Z40',
    '3D': 'Z41', '3E': 'Z42', '3F': 'Z43', '3G': 'Z44'
  },

  sketch: {
    'VC': 'Z45', 'VL': 'Z46', 'VR': 'Z47',
    '1C': 'Z48', '1L': 'Z49', '1R': 'Z50',
    '2C': 'Z51', '2L': 'Z52', '2R': 'Z53',
    '3C': 'Z54', '3L': 'Z55', '3R': 'Z56'
  }
};

CONCERTS.forEach(c => {
  c.zones.forEach(z => {
    z.dbZoneId = DB_ZONE_MAP[c.id]?.[z.k];

    if (!z.dbZoneId) {
      console.error(`Missing database ZoneID: ${c.id} / ${z.k}`);
    }
  });
});

const SOLD_RATE = {arirang: 0.45, skynote: 0.40, sketch: 0.35};
const HELD_RATE = 0.04;

(function fillSoldSeats() {
  CONCERTS.forEach(c => {
    let seed = [...c.id].reduce((a, ch) => (a*31+ch.charCodeAt(0))>>>0, 7);
    const rnd = () => (seed = (seed*1664525+1013904223)>>>0)/4294967296;
    const base = SOLD_RATE[c.id] ?? 0.35;
    c.zones.forEach(z => {
      if (c.out.includes(z.k)) return;                      
      const ex = c.ex[z.k] = c.ex[z.k] || {};
      const S = new Set(ex.S || []), H = new Set(ex.H || []);
      const zoneF = 0.55+rnd()*0.9;                         
      for (let r = 0; r < z.rows; r++) {
        const rowF = 1.35-0.7*(r/Math.max(1, z.rows-1));    
        for (let n = 1; n <= 10; n++) {
          const id = 'ABCDEFGHIJ'[r]+pad(n);
          if (S.has(id) || H.has(id)) continue;
          const v = rnd(), p = Math.min(0.8, base*zoneF*rowF);
          if (v < p) S.add(id);
          else if (v < p+HELD_RATE) H.add(id)
        }
      }
      ex.S = [...S];
      ex.H = [...H]
    })
  })
})();
