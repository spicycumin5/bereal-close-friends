// All mock content for the demo lives here.
// Real photos live in /photos as <name>-back.jpg, <name>-front.jpg and <name>-avatar.jpg;
// REAL_PHOTOS below says whose they are. Everyone else uses stock images. Individual
// posts can also be overridden in POST_OVERRIDES at the bottom.
window.DEMO = (() => {
  const avatar = (n) => `https://i.pravatar.cc/400?img=${n}`;

  // userId -> photo file prefix. Their avatar is their real BeReal profile picture,
  // today's (Sunday's) BeReal uses their real back and front camera photos, and other
  // days use their real selfie in the front-camera inset.
  const REAL_PHOTOS = { me: 'kyumin', cherry: 'cherry', evan: 'evan', miriam: 'miriam', timmy: 'timmy', aimee: 'aimee', ben: 'ben', seven: 'seven' };
  const realAvatar = (id) => REAL_PHOTOS[id] && `photos/${REAL_PHOTOS[id]}-avatar.jpg`;
  // Real locations, used on all of that person's posts. Everyone else gets a random one.
  const HOME_LOCATIONS = {
    me: 'South San Francisco, Westborough',
    cherry: 'Malibu, United States',
    evan: 'Los Angeles, North University Park',
    miriam: 'Irvine, University Town Center',
    timmy: 'Los Angeles, South Park',
    aimee: 'Manhattan, New York',
    ben: 'Los Angeles, Downtown',
    seven: 'Setagaya, Komazawa',
  };

  // The main phone belongs to "me".
  const me = { id: 'me', name: 'Kyumin', username: 'spicy_cumin', avatar: realAvatar('me') };
  // Whose phone slides in to accept Kyumin's request (if they were sent one).
  const acceptingPhone = 'evan';
  // Whose BeReal is pinned to the top of the My Friends feed.
  const feedFirst = 'ben';

  // Sponsored card shown in the My Friends feed after `after` friends' BeReals.
  const ad = {
    after: 2,
    brand: 'KYUMIN',
    cover: 'photos/today-ep-cover.jpg',
    title: 'To:Day',
    sub: 'EP · 5 songs · 2024',
    caption: 'my EP To:Day is out now 🎧 go stream it',
    cta: 'Listen on Spotify',
    url: 'https://open.spotify.com/album/1Hn5BrcclmasBLt7oID1zz',
  };

  // `reactions` = RealMojis exchanged with Kyumin this month; drives onboarding suggestions.
  const friends = [
    { id: 'aimee',  name: 'Aimee',  username: 'aimeeebeling', img: 5,  reactions: 9 },
    { id: 'jordan', name: 'Jordan', username: 'jordanb',    img: 12, reactions: 6 },
    { id: 'cherry', name: 'Cherry', username: 'cherrywui',  img: 47, reactions: 23 },
    { id: 'evan',   name: 'Evan',   username: 'evaninrig',  img: 33, reactions: 18 },
    { id: 'miriam', name: 'Miriam', username: 'miriam_kim', img: 44, reactions: 15 },
    { id: 'timmy',  name: 'Timmy',  username: 't1mmywu',    img: 13, reactions: 12 },
    { id: 'chloe',  name: 'Chloe',  username: 'chloe.dub',  img: 9,  reactions: 3 },
    { id: 'marcus', name: 'Marcus', username: 'marcus_t',   img: 59, reactions: 2 },
    { id: 'ava',    name: 'Ava',    username: 'avaaa',      img: 25, reactions: 1 },
    { id: 'ben',    name: 'Ben',    username: 'ben3moore',  reactions: 4 },
    { id: 'seven',  name: 'Seven',  username: 'victhor_seven', reactions: 2 },
  ].map((f) => ({ ...f, avatar: f.avatar || realAvatar(f.id) || avatar(f.img) }));

  // Close-friend relationships at the start of the demo. Kyumin starts with none
  // (onboarding sets them up); Timmy has already sent Kyumin a request.
  const relationships = [
    { a: 'timmy',  b: 'me',     state: 'pending', from: 'timmy' },
  ];
  // Pre-checked in the onboarding picker.
  const suggested = ['cherry', 'evan', 'miriam', 'timmy', 'aimee'];

  const week = {
    label: 'Oct 12 – 18',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    short: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    dates: ['Oct 12', 'Oct 13', 'Oct 14', 'Oct 15', 'Oct 16', 'Oct 17', 'Oct 18'],
  };

  const hm = (h, m) => h * 60 + m;
  // The daily "⚠️ Time to BeReal" notification, in minutes after midnight. Mon–Sat sit just
  // before the first real BeReal that day (WEEK_POSTS below).
  const notifTimes = [hm(14, 24), hm(14, 25), hm(11, 31), hm(7, 30), hm(18, 7), hm(18, 49), hm(13, 36)];
  // The current time on Sunday; feed timestamps read "<n> hours ago" relative to it.
  const now = 20 * 60;

  const captions = [
    'golden hour hits different', 'library grind 📚', 'pasta night 🍝', 'why is it always during class',
    'commute ft. my face', 'gym was a mistake', 'sunset run', 'coffee #3', 'rooftop w the crew',
    'laundry day glamour', 'late again, sorry', 'brunch!!', 'studying (lying)', 'concert tonight 🎶',
    'bodega cat appreciation', 'cooking for once', 'airport era ✈️', 'movie night', 'sunday reset',
    'office view', 'walk & talk', 'thrifting', 'this is my 4th nap', '',
  ];
  const locations = [
    'Brooklyn, NY', 'Lower East Side', 'Williamsburg', 'Upper West Side', 'Astoria',
    'Greenpoint', 'Midtown', 'Bushwick', 'Washington Sq Park', 'Long Island City',
  ];

  // Deterministic RNG so the demo looks the same every load.
  let seed = 20261018;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = (a) => a[Math.floor(rand() * a.length)];

  const posts = [];
  [me, ...friends].forEach((u) => {
    for (let d = 0; d < 7; d++) {
      if (u.id !== 'me' && rand() < 0.15) continue; // some people skip days
      const late = rand() < 0.35;
      const delay = late ? 20 + Math.floor(rand() * 200) : Math.floor(rand() * 2);
      posts.push({
        id: `${u.id}-${d}`,
        userId: u.id,
        day: d,
        minutes: Math.min(notifTimes[d] + delay, 23 * 60 + 59),
        late: late ? delay : 0,
        back: `https://picsum.photos/seed/bcf-${u.id}-${d}/600/800`,
        front: REAL_PHOTOS[u.id] ? `photos/${REAL_PHOTOS[u.id]}-front.jpg` : u.avatar,
        caption: pick(captions),
        location: pick(locations),
      });
    }
  });

  // Today's BeReal for everyone with real photos (created if the seed skipped their Sunday).
  Object.entries(REAL_PHOTOS).forEach(([userId, file]) => {
    const photos = { back: `photos/${file}-back.jpg`, front: `photos/${file}-front.jpg` };
    const today = posts.find((p) => p.userId === userId && p.day === 6);
    if (today) Object.assign(today, photos);
    else posts.push({ id: `${userId}-6`, userId, day: 6, minutes: notifTimes[6] + 1, late: 0, caption: '', location: pick(locations), ...photos });
  });
  posts.forEach((p) => { if (HOME_LOCATIONS[p.userId]) p.location = HOME_LOCATIONS[p.userId]; });

  // Real BeReals from earlier in the week (Mon = 0), cropped to photos/<file>-back.jpg and
  // <file>-front.jpg at their real post times. Anyone listed here only has these posts before
  // Sunday, replacing the stock ones; a post is late if it came more than 2 min after notifTimes.
  const WEEK_POSTS = [
    { userId: 'evan',   day: 0, file: 'evan-mon',   minutes: hm(14, 26), location: 'Los Angeles, North University Park' },
    { userId: 'aimee',  day: 0, file: 'aimee-mon',  minutes: hm(16, 13) },
    { userId: 'miriam', day: 0, file: 'miriam-mon', minutes: hm(19, 12), location: 'Chino Hills, United States' },
    { userId: 'cherry', day: 0, file: 'cherry-mon', minutes: hm(19, 16), location: 'South Pasadena, Downtown' },
    { userId: 'timmy',  day: 0, file: 'timmy-mon',  minutes: hm(20, 18), location: 'South Pasadena, Downtown' },
    { userId: 'evan',   day: 1, file: 'evan-tue',   minutes: hm(14, 27), location: 'Los Angeles, North University Park' },
    { userId: 'aimee',  day: 1, file: 'aimee-tue',  minutes: hm(14, 56), caption: 'Mog ops' },
    { userId: 'miriam', day: 1, file: 'miriam-tue', minutes: hm(15, 10), location: 'Fullerton, United States' },
    { userId: 'evan',   day: 2, file: 'evan-wed',   minutes: hm(11, 33), location: 'Yorba Linda, United States' },
    { userId: 'miriam', day: 2, file: 'miriam-wed', minutes: hm(13, 2),  location: 'Chino, United States' },
    { userId: 'aimee',  day: 2, file: 'aimee-wed',  minutes: hm(16, 42) },
    { userId: 'timmy',  day: 3, file: 'timmy-thu',  minutes: hm(7, 31),  location: 'Los Angeles, Lafayette Park' },
    { userId: 'me',     day: 3, file: 'kyumin-thu', minutes: hm(11, 18), location: 'San Francisco' },
    { userId: 'me',     day: 4, file: 'kyumin-fri', minutes: hm(18, 9),  location: 'Pacifica, Westview', caption: 'if you can, maybe I can too 🌱' },
    { userId: 'me',     day: 5, file: 'kyumin-sat', minutes: hm(18, 50) },
    { userId: 'timmy',  day: 5, file: 'timmy-sat',  minutes: hm(19, 23), location: 'Los Angeles, Valley Glen', caption: 'ian eastwood halloween' },
  ];
  const weekPosters = new Set(WEEK_POSTS.map((p) => p.userId));
  for (let i = posts.length - 1; i >= 0; i--) {
    if (weekPosters.has(posts[i].userId) && posts[i].day < 6) posts.splice(i, 1);
  }
  WEEK_POSTS.forEach(({ file, ...p }) => {
    const late = p.minutes - notifTimes[p.day];
    posts.push({
      id: `${p.userId}-${p.day}`, late: late > 2 ? late : 0, caption: '', location: HOME_LOCATIONS[p.userId],
      back: `photos/${file}-back.jpg`, front: `photos/${file}-front.jpg`, ...p,
    });
  });


  // Override any post here, keyed by "<userId>-<dayIndex>" (Mon = 0),
  // e.g. 'chloe-6': { back: 'photos/chloe-back.jpg', front: 'photos/chloe-front.jpg', caption: 'hi' }
  // Sunday ("today") is tuned so the lock-screen demo has both on-time and late close friends.
  const POST_OVERRIDES = {
    'me-6':     { caption: 'monke distraked' },
    'cherry-6': { caption: '' },
    'evan-6':   { minutes: notifTimes[6] + 137, late: 137, caption: 'i need a haircut' },
    'miriam-6': { caption: '' },
    'timmy-6':  { minutes: notifTimes[6] + 360, late: 360, caption: '' },
    'ben-6':    { minutes: 19 * 60 + 36, late: 0, caption: '' },
    'seven-6':  { minutes: now - 24, late: now - 24 - notifTimes[6], caption: 'お分かりいただけただろうか' },
    'aimee-6':  { minutes: notifTimes[6] + 32,  late: 32, caption: 'Claude chose me as the teams snack busboy this week 😋' },
  };
  posts.forEach((p) => Object.assign(p, POST_OVERRIDES[p.id]));

  // The Activity screen (the bell on the feed): reactions and comments on Kyumin's BeReal today.
  // `minutes` = minutes after midnight on Sunday.
  const activity = [
    { userId: 'cherry', type: 'realmoji', emoji: '😂', minutes: now - 6 },
    { userId: 'evan',   type: 'comment', text: 'monke deserves a break', minutes: now - 18 },
    { userId: 'miriam', type: 'realmoji', emoji: '😍', minutes: now - 41 },
    { userId: 'aimee',  type: 'comment', text: 'distraked by what 😭', minutes: now - 95 },
    { userId: 'seven',  type: 'realmoji', emoji: '👍', minutes: now - 150 },
  ];

  return { me, friends, acceptingPhone, feedFirst, ad, relationships, suggested, week, notifTimes, now, posts, activity, today: 6 };
})();
