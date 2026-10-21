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

  // Sponsored post shown in the My Friends feed after `after` friends' BeReals.
  const ad = {
    after: 2,
    brand: 'KYUMIN',
    avatar: 'photos/kyumin-avatar.jpg',
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

  // The daily "⚠️ Time to BeReal" notification, in minutes after midnight.
  const notifTimes = [12 * 60 + 41, 16 * 60 + 3, 10 * 60 + 22, 19 * 60 + 47, 14 * 60 + 15, 21 * 60 + 8, 13 * 60 + 36];
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
    'seven-6':  { minutes: now - 23, late: now - 23 - notifTimes[6], caption: 'お分かりいただけただろうか' },
    'aimee-6':  { minutes: notifTimes[6] + 32,  late: 32, caption: 'Claude chose me as the teams snack busboy this week 😋' },
  };
  posts.forEach((p) => Object.assign(p, POST_OVERRIDES[p.id]));

  return { me, friends, acceptingPhone, feedFirst, ad, relationships, suggested, week, notifTimes, now, posts, today: 6 };
})();
