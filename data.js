// All mock content for the demo lives here.
// To use your own photos: drop files into /photos and replace the URLs below,
// e.g. set a user's `avatar` to "photos/maya.jpg", or override individual posts
// in POST_OVERRIDES at the bottom (back = main camera, front = selfie inset).
window.DEMO = (() => {
  const avatar = (n) => `https://i.pravatar.cc/400?img=${n}`;

  // The main phone belongs to "me". In two-phone mode, the second phone is `secondPhone`.
  const me = { id: 'me', name: 'Alex', username: 'alex', avatar: avatar(68) };
  const secondPhone = 'jordan';

  // `reactions` = RealMojis exchanged with Alex this month; drives onboarding suggestions.
  const friends = [
    { id: 'maya',   name: 'Maya',   username: 'mayachen',   img: 5,  reactions: 9 },
    { id: 'jordan', name: 'Jordan', username: 'jordanb',    img: 12, reactions: 6 },
    { id: 'priya',  name: 'Priya',  username: 'priya.k',    img: 47, reactions: 23 },
    { id: 'leo',    name: 'Leo',    username: 'leo.m',      img: 33, reactions: 18 },
    { id: 'sofia',  name: 'Sofia',  username: 'sofiaxr',    img: 44, reactions: 15 },
    { id: 'ethan',  name: 'Ethan',  username: 'ethanw',     img: 13, reactions: 12 },
    { id: 'chloe',  name: 'Chloe',  username: 'chloe.dub',  img: 9,  reactions: 3 },
    { id: 'marcus', name: 'Marcus', username: 'marcus_t',   img: 59, reactions: 2 },
    { id: 'ava',    name: 'Ava',    username: 'avaaa',      img: 25, reactions: 1 },
  ].map((f) => ({ ...f, avatar: avatar(f.img) }));

  // Close-friend relationships at the start of the demo. Alex starts with none
  // (onboarding sets them up); Maya has already sent Alex a request.
  const relationships = [
    { a: 'maya',   b: 'me',     state: 'pending', from: 'maya' },
    { a: 'jordan', b: 'chloe',  state: 'close' },
    { a: 'jordan', b: 'marcus', state: 'close' },
    { a: 'jordan', b: 'ava',    state: 'close' },
  ];
  // Pre-checked in the onboarding picker.
  const suggested = ['priya', 'leo', 'sofia', 'ethan'];

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
        front: u.avatar,
        caption: pick(captions),
        location: pick(locations),
      });
    }
  });

  // Override any post here, keyed by "<userId>-<dayIndex>" (Mon = 0).
  // e.g. 'maya-6': { back: 'photos/maya-sun-back.jpg', front: 'photos/maya-sun-front.jpg', caption: 'hi' }
  // Sunday ("today") is tuned so the lock-screen demo has both on-time and late close friends.
  const POST_OVERRIDES = {
    'leo-6':  { minutes: notifTimes[6] + 137, late: 137 },
    'maya-6': { minutes: notifTimes[6] + 32,  late: 32 },
  };
  posts.forEach((p) => Object.assign(p, POST_OVERRIDES[p.id]));

  return { me, friends, secondPhone, relationships, suggested, week, notifTimes, posts, today: 6 };
})();
