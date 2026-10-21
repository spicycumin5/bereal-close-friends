// All mock content for the demo lives here.
// Real photos live in /photos as <name>-back.jpg, <name>-front.jpg and <name>-avatar.jpg;
// REAL_PHOTOS below says whose they are. Everyone else uses stock images. Individual
// posts can also be overridden in POST_OVERRIDES at the bottom.
window.DEMO = (() => {
  const avatar = (n) => `https://i.pravatar.cc/400?img=${n}`;

  // userId -> photo file prefix. Their avatar is their real BeReal profile picture,
  // today's (Sunday's) BeReal uses their real back and front camera photos, and other
  // days use their real selfie in the front-camera inset.
  const REAL_PHOTOS = { me: 'kyumin', cherry: 'cherry', evan: 'evan', miriam: 'miriam', timmy: 'timmy', aimee: 'aimee' };
  const realAvatar = (id) => REAL_PHOTOS[id] && `photos/${REAL_PHOTOS[id]}-avatar.jpg`;
  // Real locations, used on all of that person's posts. Everyone else gets a random one.
  const HOME_LOCATIONS = {
    me: 'South San Francisco, Westborough',
    cherry: 'Malibu, United States',
    evan: 'Los Angeles, North University Park',
    miriam: 'Irvine, University Town Center',
    timmy: 'Los Angeles, South Park',
    aimee: 'Manhattan, New York',
  };

  // The main phone belongs to "me". In two-phone mode, the second phone is `secondPhone`.
  const me = { id: 'me', name: 'Kyumin', username: 'kyumin', avatar: realAvatar('me') };
  const secondPhone = 'jordan';
  // Whose phone slides in to accept Kyumin's request in one-phone mode (if they were sent one).
  const acceptingPhone = 'evan';

  // `reactions` = RealMojis exchanged with Kyumin this month; drives onboarding suggestions.
  const friends = [
    { id: 'aimee',  name: 'Aimee',  username: 'aimee',      img: 5,  reactions: 9 },
    { id: 'jordan', name: 'Jordan', username: 'jordanb',    img: 12, reactions: 6 },
    { id: 'cherry', name: 'Cherry', username: 'cherry',     img: 47, reactions: 23 },
    { id: 'evan',   name: 'Evan',   username: 'evan',       img: 33, reactions: 18 },
    { id: 'miriam', name: 'Miriam', username: 'miriam',     img: 44, reactions: 15 },
    { id: 'timmy',  name: 'Timmy',  username: 'timmy',      img: 13, reactions: 12 },
    { id: 'chloe',  name: 'Chloe',  username: 'chloe.dub',  img: 9,  reactions: 3 },
    { id: 'marcus', name: 'Marcus', username: 'marcus_t',   img: 59, reactions: 2 },
    { id: 'ava',    name: 'Ava',    username: 'avaaa',      img: 25, reactions: 1 },
    { id: 'ben',    name: 'Ben',    username: 'ben3moore',  avatar: 'photos/ben-avatar.jpg', reactions: 4 },
  ].map((f) => ({ ...f, avatar: f.avatar || realAvatar(f.id) || avatar(f.img) }));

  // Close-friend relationships at the start of the demo. Kyumin starts with none
  // (onboarding sets them up); Timmy has already sent Kyumin a request.
  const relationships = [
    { a: 'timmy',  b: 'me',     state: 'pending', from: 'timmy' },
    { a: 'jordan', b: 'chloe',  state: 'close' },
    { a: 'jordan', b: 'marcus', state: 'close' },
    { a: 'jordan', b: 'ava',    state: 'close' },
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

  // Ben's photo came from a feed screenshot with the selfie inset already baked in,
  // so it's a single image with no separate front camera (front: null).
  const benToday = { back: 'photos/ben-bereal.jpg', front: null, caption: '' };
  const benPost = posts.find((p) => p.id === 'ben-6');
  if (benPost) Object.assign(benPost, benToday);
  else posts.push({ id: 'ben-6', userId: 'ben', day: 6, minutes: notifTimes[6] + 4, late: 0, location: 'Midtown', ...benToday });

  // Override any post here, keyed by "<userId>-<dayIndex>" (Mon = 0),
  // e.g. 'chloe-6': { back: 'photos/chloe-back.jpg', front: 'photos/chloe-front.jpg', caption: 'hi' }
  // Sunday ("today") is tuned so the lock-screen demo has both on-time and late close friends.
  const POST_OVERRIDES = {
    'me-6':     { caption: 'monke distraked' },
    'cherry-6': { caption: '' },
    'evan-6':   { minutes: notifTimes[6] + 137, late: 137, caption: 'i need a haircut' },
    'miriam-6': { caption: '' },
    'timmy-6':  { caption: '' },
    'aimee-6':  { minutes: notifTimes[6] + 32,  late: 32, caption: 'Claude chose me as the teams snack busboy this week 😋' },
  };
  posts.forEach((p) => Object.assign(p, POST_OVERRIDES[p.id]));

  return { me, friends, secondPhone, acceptingPhone, relationships, suggested, week, notifTimes, posts, today: 6 };
})();
