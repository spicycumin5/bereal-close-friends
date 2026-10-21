(() => {
  const D = window.DEMO;
  const $ = (s, el = document) => el.querySelector(s);

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.9.8 3.1 2.6 3.5 5.2"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    mutual: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></svg>',
  };
  const STATUS_ICONS = `
    <svg viewBox="0 0 18 12" width="18" height="12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg viewBox="0 0 26 12" width="26" height="12" fill="none"><rect x=".5" y=".5" width="22" height="11" rx="3.5" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><rect x="24" y="4" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".4"/></svg>`;

  const users = Object.fromEntries([D.me, ...D.friends].map((u) => [u.id, u]));
  const allIds = Object.keys(users);

  const fmtTime = (m) => {
    const h = Math.floor(m / 60) % 24;
    return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  const clockTime = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}`;
  const lateLabel = (p) => (p.late >= 60 ? `${Math.floor(p.late / 60)}h late` : `${p.late}m late`);
  const img = (src, cls = '', extra = '') => `<img class="${cls}" src="${src}" alt="" ${extra} onerror="this.classList.add('broken')">`;

  // Every scheduled demo event goes through `later` so "Reset" can cancel all of them.
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

  // ---------- Shared close-friend store (both phones read from this) ----------
  const store = (() => {
    const rel = new Map();
    const subs = new Set();
    const key = (a, b) => [a, b].sort().join('|');
    const reset = () => {
      rel.clear();
      D.relationships.forEach((r) => rel.set(key(r.a, r.b), { state: r.state, from: r.from }));
    };
    reset();
    return {
      reset,
      // From `viewer`'s point of view: 'close' | 'outgoing' | 'incoming' | 'none'
      status(viewer, other) {
        const r = rel.get(key(viewer, other));
        if (!r) return 'none';
        if (r.state === 'close') return 'close';
        return r.from === viewer ? 'outgoing' : 'incoming';
      },
      set(a, b, val, ev = {}) {
        val ? rel.set(key(a, b), val) : rel.delete(key(a, b));
        subs.forEach((fn) => fn(ev));
      },
      subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    };
  })();

  const phones = {};

  function sendRequest(from, to) {
    store.set(from, to, { state: 'pending', from }, { type: 'request', from, to });
    // Friends without a phone on screen accept on their own after a moment.
    if (!phones[to]) {
      later(() => { if (store.status(to, from) === 'incoming') acceptRequest(to, from); }, 1400 + Math.random() * 1800);
    }
  }
  const acceptRequest = (by, other) => store.set(by, other, { state: 'close' }, { type: 'accept', from: by, to: other });
  const declineRequest = (by, other) => store.set(by, other, null, { type: 'decline', from: by, to: other });
  const removeClose = (by, other) => store.set(by, other, null, { type: 'remove', from: by, to: other });

  // ---------- A phone ----------
  function createPhone(userId, mount, hooks = {}) {
    const self = users[userId];
    const wrap = document.createElement('div');
    wrap.className = `phone-wrap ${hooks.guest ? 'guest' : ''}`;
    wrap.innerHTML = `
      <div class="phone-label">${img(self.avatar)}<span>${self.name}'s phone</span></div>
      <div class="phone">
        <div class="phone-screen">
          <div class="statusbar"><span class="sb-time">9:41</span><span class="island"></span><span class="sb-icons">${STATUS_ICONS}</span></div>
          <div class="app"></div>
          <div class="toast" role="status" aria-live="polite"></div>
        </div>
      </div>`;
    mount.appendChild(wrap);
    const screenEl = $('.phone-screen', wrap);
    const app = $('.app', wrap);
    const toastEl = $('.toast', wrap);

    const initial = () => ({
      screen: 'feed', tab: 'all', swapped: new Set(), highlight: null,
      onboard: null, picks: new Set(), sent: [], sentShown: new Set(),
      locked: false, off: false, offCaption: '', lockNotifs: [], clock: null,
      scrollTo: null, viewKey: '',
    });
    const S = initial();

    const friends = () => allIds.filter((id) => id !== userId).map((id) => users[id]);
    const st = (id) => store.status(userId, id);
    const isClose = (id) => st(id) === 'close';
    const closeFriends = () => friends().filter((f) => isClose(f.id));
    const circle = () => [userId, ...closeFriends().map((f) => f.id)];
    const nameOf = (id) => (id === userId ? 'You' : users[id].name);

    // ---------- Rendering ----------
    function render() {
      const key = S.locked ? 'lock' : S.onboard && S.onboard !== 'intro' ? `ob-${S.onboard}` : S.screen + S.tab + (S.onboard || '');
      const entering = key !== S.viewKey;
      const prev = $('.scroll', app);
      const keepScroll = !entering && prev ? prev.scrollTop : 0;

      let html;
      if (S.locked) html = lockView();
      else if (S.onboard === 'pick') html = pickView();
      else if (S.onboard === 'sent') html = sentView();
      else html = (S.screen === 'feed' ? feedView() : friendsView()) + (S.onboard === 'intro' ? introSheet() : '');

      app.innerHTML = `<div class="view ${entering ? 'enter' : ''}">${html}</div>`;
      screenEl.classList.toggle('locked', S.locked);
      screenEl.classList.toggle('off', S.locked && S.off);

      const next = $('.scroll', app);
      if (next) next.scrollTop = keepScroll;
      if (S.scrollTo) {
        const target = $(`[data-post="${S.scrollTo}"]`, app);
        if (next && target) next.scrollTop = target.offsetTop - next.offsetTop - 8;
        S.scrollTo = null;
      }
      S.viewKey = key;
      S.highlight = null;
      S.lockNotifs.forEach((n) => { n.fresh = false; });
    }

    function feedView() {
      const today = D.posts.filter((p) => p.day === D.today && p.userId !== userId).sort((a, b) => a.minutes - b.minutes);
      const list = S.tab === 'close' ? today.filter((p) => isClose(p.userId)) : today;
      const mine = D.posts.find((p) => p.userId === userId && p.day === D.today);
      const hasIncoming = friends().some((f) => st(f.id) === 'incoming');
      return `
        <header class="top">
          <button class="icon-btn" data-action="go-friends" aria-label="Friends">${ICONS.people}${hasIncoming ? '<span class="dot"></span>' : ''}</button>
          <div class="logo">BeReal.</div>
          ${img(self.avatar, 'me-avatar')}
        </header>
        <nav class="tabs">
          <button class="tab ${S.tab === 'all' ? 'active' : ''}" data-action="tab" data-tab="all">My Friends</button>
          <button class="tab cf ${S.tab === 'close' ? 'active' : ''}" data-action="tab" data-tab="close">${ICONS.star}Close Friends</button>
        </nav>
        <div class="scroll">
          ${mine ? myBeReal(mine) : ''}
          ${S.tab === 'close' ? recapCard() : ''}
          ${list.length ? list.map(postView).join('') : emptyFeed()}
        </div>`;
    }

    const myBeReal = (p) => `<div class="mine">${dual(p)}<div class="mine-cap">My BeReal · ${fmtTime(p.minutes)}</div></div>`;

    function dual(p) {
      // Posts without a separate front camera (inset already in the photo) can't be swapped.
      if (!p.front) return `<div class="dual">${img(p.back, 'back', 'loading="lazy"')}</div>`;
      const sw = S.swapped.has(p.id);
      return `<div class="dual" data-action="swap" data-id="${p.id}">
        ${img(sw ? p.front : p.back, 'back', 'loading="lazy"')}
        ${img(sw ? p.back : p.front, 'front')}
      </div>`;
    }

    function postView(p) {
      const u = users[p.userId];
      return `<article class="post" data-post="${p.id}">
        <div class="post-head">
          ${img(u.avatar, 'avatar')}
          <div class="who">
            <div class="name">${u.name}${isClose(u.id) ? `<span class="cf-badge" title="Close friend">${ICONS.star}</span>` : ''}</div>
            <div class="meta"><span class="loc">${p.location}</span><span class="when">· ${p.late ? lateLabel(p) : fmtTime(p.minutes)}</span></div>
          </div>
          <span class="more">•••</span>
        </div>
        ${dual(p)}
        <div class="caption">${p.caption}</div>
        <div class="comment">Add a comment…</div>
      </article>`;
    }

    function recapCard() {
      if (!closeFriends().length) return '';
      const members = circle();
      const weekPosts = D.posts.filter((p) => members.includes(p.userId));
      const mosaic = weekPosts.filter((p) => p.userId !== userId).slice(0, 4);
      return `<button class="recap-card" data-action="open-reel">
        <div class="recap-mosaic">${mosaic.map((p) => img(p.back)).join('')}</div>
        <div class="recap-body">
          <div class="recap-text">
            <span class="recap-chip">${ICONS.star} Weekly recap</span>
            <div class="recap-title">Your week with Close Friends</div>
            <div class="recap-sub">${D.week.label} · ${weekPosts.length} BeReals</div>
            <div class="stack">${members.map((id) => img(users[id].avatar)).join('')}</div>
          </div>
          <div class="play">${ICONS.play}</div>
        </div>
      </button>`;
    }

    function emptyFeed() {
      if (S.tab !== 'close') return '<div class="empty">No BeReals yet today.</div>';
      if (!closeFriends().length) {
        return `<div class="empty">
          <div class="empty-icon">${ICONS.star}</div>
          <h3>No close friends yet</h3>
          Add close friends to see just their BeReals here and get a recap of your week together every Sunday.
          <div><button class="btn primary" data-action="go-friends">Add close friends</button></div>
        </div>`;
      }
      return '<div class="empty">None of your close friends have posted today yet.</div>';
    }

    function friendsView() {
      const incoming = friends().filter((f) => st(f.id) === 'incoming');
      const close = closeFriends();
      const others = friends().filter((f) => ['none', 'outgoing'].includes(st(f.id)));
      return `
        <header class="top">
          <button class="icon-btn" data-action="go-feed" aria-label="Back">${ICONS.back}</button>
          <div class="title">Friends</div>
          <span></span>
        </header>
        <div class="scroll pad">
          <p class="explainer">${ICONS.star}<span>Close friends see each other in the <b>Close Friends</b> tab and get a recap of their week together every Sunday. Both of you have to accept.</span></p>
          ${incoming.length ? section('Close friend requests', incoming.map((f) => row(f,
            `<button class="btn ghost" data-action="decline" data-id="${f.id}">Decline</button>
             <button class="btn primary" data-action="accept" data-id="${f.id}">Accept</button>`,
            'wants to be close friends'))) : ''}
          ${section(`Close friends · ${close.length}`, close.map((f) => row(f,
            `<button class="btn close-on" data-action="remove" data-id="${f.id}">${ICONS.star} Close friend</button>`)),
            'No close friends yet')}
          ${section(`My friends · ${others.length}`, others.map((f) => row(f,
            st(f.id) === 'outgoing'
              ? '<button class="btn pending" disabled>Requested</button>'
              : `<button class="btn primary" data-action="request" data-id="${f.id}">${ICONS.plus} Close friend</button>`)))}
        </div>`;
    }

    const section = (title, rows, emptyText = '') =>
      `<div class="section"><div class="section-title">${title}</div>${rows.length ? rows.join('') : `<div class="section-empty">${emptyText}</div>`}</div>`;

    const row = (f, actions, sub = '') => `<div class="row ${S.highlight === f.id ? 'highlight' : ''}">
        ${img(f.avatar, 'avatar')}
        <div class="who">
          <div class="row-name">${f.name}</div>
          <div class="row-user">@${f.username}</div>
          ${sub ? `<div class="row-sub">${sub}</div>` : ''}
        </div>
        <div class="row-actions">${actions}</div>
      </div>`;

    // ---------- Onboarding ----------
    function introSheet() {
      const faces = [...D.suggested, 'jordan'].filter((id) => id !== userId).slice(0, 6);
      const orbit = faces.map((id, i) => {
        const a = (i / faces.length) * Math.PI * 2 - Math.PI / 2;
        return img(users[id].avatar, 'orb', `style="left:${50 + 40 * Math.cos(a)}%;top:${50 + 40 * Math.sin(a)}%"`);
      }).join('');
      return `<div class="sheet-backdrop">
        <div class="sheet">
          <div class="grabber"></div>
          <div class="orbit"><div class="orbit-ring">${orbit}</div><div class="orbit-star">${ICONS.star}</div></div>
          <div class="ob-new">New on BeReal</div>
          <h2 class="ob-title">Close Friends</h2>
          <p class="ob-sub">Same BeReal. Just a little closer.</p>
          <ul class="ob-points">
            <li><span class="ob-ic">${ICONS.star}</span><div><b>A tab for your people</b><span>Filter your feed down to just your close friends.</span></div></li>
            <li><span class="ob-ic">${ICONS.mutual}</span><div><b>Always mutual</b><span>They add you back, or it doesn't happen. No secret lists.</span></div></li>
            <li><span class="ob-ic">${ICONS.film}</span><div><b>Your week, every Sunday</b><span>A recap of your circle's BeReals, day by day.</span></div></li>
          </ul>
          <button class="btn primary big" data-action="ob-start">Choose close friends</button>
          <button class="ob-later" data-action="ob-close">Not now</button>
        </div>
      </div>`;
    }

    function pickView() {
      const candidates = friends().filter((f) => st(f.id) !== 'close');
      const isSuggested = (f) => st(f.id) === 'incoming' || D.suggested.includes(f.id);
      const byReactions = (a, b) => (st(b.id) === 'incoming') - (st(a.id) === 'incoming') || b.reactions - a.reactions;
      const sugg = candidates.filter(isSuggested).sort(byReactions);
      const rest = candidates.filter((f) => !isSuggested(f)).sort(byReactions);
      const n = S.picks.size;
      const pickRow = (f) => {
        const on = S.picks.has(f.id);
        const reason = st(f.id) === 'incoming' ? '<span class="green">Already asked to be close friends</span>'
          : st(f.id) === 'outgoing' ? 'Request pending' : `${f.reactions} RealMoji${f.reactions === 1 ? '' : 's'} this month`;
        return `<button class="pick-row ${on ? 'on' : ''}" data-action="ob-toggle" data-id="${f.id}">
          ${img(f.avatar, 'avatar')}
          <div class="who"><div class="row-name">${f.name}</div><div class="row-user">${reason}</div></div>
          <span class="check">${on ? ICONS.check : ''}</span>
        </button>`;
      };
      return `
        <header class="top">
          <button class="icon-btn" data-action="ob-back" aria-label="Back">${ICONS.back}</button>
          <div class="title">Close Friends</div>
          <span></span>
        </header>
        <div class="scroll pad">
          <h2 class="pick-title">Who's in your circle?</h2>
          <p class="pick-sub">Suggested from who you RealMoji with the most. They'll get a request, and you can change this anytime.</p>
          ${sugg.length ? `<div class="section-title">Suggested</div>${sugg.map(pickRow).join('')}` : ''}
          ${rest.length ? `<div class="section-title spaced">All friends</div>${rest.map(pickRow).join('')}` : ''}
        </div>
        <div class="ob-footer">
          <button class="btn primary big" data-action="ob-send" ${n ? '' : 'disabled'}>${n ? `Send ${n} request${n === 1 ? '' : 's'}` : 'Pick at least one friend'}</button>
        </div>`;
    }

    function sentView() {
      const done = S.sent.filter(isClose).length;
      const rows = S.sent.map((id) => {
        const f = users[id];
        let status = '<button class="btn pending" disabled>Requested</button>';
        if (isClose(id)) {
          status = `<span class="sent-ok ${S.sentShown.has(id) ? '' : 'fresh'}">${ICONS.check} Close friends</span>`;
          S.sentShown.add(id);
        }
        return `<div class="row">${img(f.avatar, 'avatar')}<div class="who"><div class="row-name">${f.name}</div><div class="row-user">@${f.username}</div></div>${status}</div>`;
      }).join('');
      return `
        <div class="scroll pad sent">
          <div class="sent-check">${ICONS.check}</div>
          <h2 class="pick-title center">Requests sent</h2>
          <p class="pick-sub center">${done} of ${S.sent.length} accepted so far. As people say yes, they show up in your Close Friends tab.</p>
          ${rows}
        </div>
        <div class="ob-footer">
          <button class="btn primary big" data-action="ob-done">Go to Close Friends</button>
        </div>`;
    }

    // ---------- Lock screen ----------
    function lockView() {
      if (S.off) return `<div class="lock off">${S.offCaption ? `<div class="off-caption">${S.offCaption}</div>` : ''}</div>`;
      const m = S.clock ?? D.notifTimes[D.today];
      const waking = S.waking;
      S.waking = false;
      return `<div class="lock ${waking ? 'waking' : ''}">
        <div class="lock-head">
          <div class="lock-date">Sunday, October 18</div>
          <div class="lock-time">${clockTime(m)}</div>
        </div>
        <div class="lock-notifs">${S.lockNotifs.map((n, i) => notifCard(n, i)).join('')}</div>
        <button class="lock-foot" data-action="unlock">Tap to open</button>
      </div>`;
    }

    function notifCard(n, i) {
      const ago = n.minutes != null && S.clock != null ? S.clock - n.minutes : 0;
      const when = ago <= 0 ? 'now' : ago < 60 ? `${ago}m ago` : `${Math.floor(ago / 60)}h ago`;
      return `<button class="notif ${n.fresh ? 'fresh' : ''}" data-action="notif" data-i="${i}" data-nid="${n.nid}">
        <div class="push-icon">BeReal.</div>
        <div class="notif-body">
          <div class="push-app"><span>BeReal</span><span>${when}</span></div>
          <div class="push-title">${n.title}</div>
          <div class="push-body">${n.body}</div>
        </div>
        ${notifAvatars(n)}
      </button>`;
    }

    // Two lock-screen scenes: 'ontime' (the BeReal alert + close friends posting on time)
    // and 'late' (a fresh lock screen later in the day with only the late posts).
    const notifAvatars = (n) => {
      if (n.avatars) return `<div class="notif-stack">${n.avatars.slice(0, 3).map((id) => img(users[id].avatar)).join('')}</div>`;
      return n.avatar ? img(users[n.avatar].avatar, 'notif-av') : '';
    };
    let notifSeq = 0;

    function lock(scene = 'ontime') {
      closeReel();
      clearPushes();
      // If the lock screen is already lit, fade it to black before the next scene instead of cutting.
      const lit = S.locked && !S.off && $('.lock', app);
      if (lit) {
        lit.classList.add('dimming');
        later(() => startScene(scene), 650);
      } else {
        startScene(scene);
      }
    }

    function startScene(scene) {
      const caption = scene === 'late' ? 'Later that day…' : '';
      Object.assign(S, { locked: true, off: true, offCaption: caption, lockNotifs: [], onboard: null, clock: null });
      render();
      const posts = D.posts
        .filter((p) => p.day === D.today && p.userId !== userId && isClose(p.userId))
        .filter((p) => (scene === 'late' ? p.late : !p.late))
        .sort((a, b) => a.minutes - b.minutes)
        .slice(0, 5);
      let seq;
      if (scene === 'late') {
        // Late posts are summarised in a single notification.
        seq = posts.length ? [lateSummary(posts)] : [];
      } else {
        seq = [
          { title: '⚠️ Time to BeReal. ⚠️', body: '2 min left to capture a BeReal and see what your friends are up to.', minutes: D.notifTimes[D.today], go: 'close' },
          ...posts.map((p) => ({
            title: `★ ${users[p.userId].name} posted on time`, body: 'Right when the notification hit. Tap to see their BeReal.',
            avatar: p.userId, minutes: p.minutes, post: p.id, go: 'close',
          })),
        ];
      }
      if (!seq.length) {
        const body = closeFriends().length ? 'Everyone in your circle posted on time today 🎉' : 'Add close friends to hear when they post.';
        seq.push({ title: '★ Close Friends', body, minutes: D.notifTimes[D.today] + 180, go: scene === 'late' && !closeFriends().length ? 'friends' : 'close' });
      }
      const start = caption ? 2200 : 1200;
      seq.forEach((n, i) => later(() => {
        if (!S.locked) return;
        S.clock = n.minutes;
        notify(n);
      }, start + i * 1800));
    }

    function lateSummary(posts) {
      const last = posts[posts.length - 1];
      if (posts.length === 1) {
        return { title: `★ ${users[last.userId].name} posted late`, body: `${lateLabel(last)}, but they made it. Tap to see their BeReal.`, avatar: last.userId, minutes: last.minutes, post: last.id, go: 'close' };
      }
      const parts = posts.map((p) => `${users[p.userId].name} (${lateLabel(p).replace(' late', '')})`);
      const list = `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
      return {
        title: `★ ${posts.length} close friends posted late`, body: `${list} made it after all. Tap to catch up.`,
        avatars: posts.map((p) => p.userId), minutes: last.minutes, post: posts[0].id, go: 'close',
      };
    }

    // Adds a notification to a lit lock screen in place, sliding older ones down,
    // instead of re-rendering the whole screen.
    function addLockNotif(n) {
      const list = $('.lock-notifs', app);
      const before = new Map([...list.children].map((c) => [c.dataset.nid, c.getBoundingClientRect().top]));
      list.innerHTML = S.lockNotifs.map((x, i) => notifCard(x, i)).join('');
      $('.lock-time', app).textContent = clockTime(S.clock ?? D.notifTimes[D.today]);
      [...list.children].forEach((c) => {
        const top = before.get(c.dataset.nid);
        if (top != null) {
          c.animate([{ transform: `translateY(${top - c.getBoundingClientRect().top}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2, .9, .3, 1)' });
        }
      });
      S.lockNotifs.forEach((x) => { x.fresh = false; });
    }

    // ---------- Notifications ----------
    function notify(n) {
      if (S.locked) {
        S.lockNotifs.unshift({ ...n, fresh: true, nid: ++notifSeq });
        if (S.off) {
          // First notification wakes the screen.
          Object.assign(S, { off: false, waking: true });
          render();
        } else {
          addLockNotif(n);
        }
        return;
      }
      clearPushes();
      const el = document.createElement('button');
      el.className = 'push';
      el.innerHTML = `<div class="push-icon">BeReal.</div>
        <div class="notif-body"><div class="push-app"><span>BeReal</span><span>now</span></div>
        <div class="push-title">${n.title}</div><div class="push-body">${n.body}</div></div>
        ${notifAvatars(n)}`;
      el.onclick = () => { el.remove(); route(n); };
      screenEl.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
      later(() => { el.classList.remove('show'); later(() => el.remove(), 500); }, 9000);
    }
    const clearPushes = () => screenEl.querySelectorAll('.push').forEach((p) => p.remove());

    function route(n) {
      closeReel();
      Object.assign(S, { locked: false, off: false, onboard: null });
      if (n.go === 'friends') S.screen = 'friends';
      else {
        S.screen = 'feed';
        S.tab = 'close';
        if (n.post) S.scrollTo = n.post;
      }
      render();
      if (n.go === 'reel') openReel();
    }

    let toastTimer;
    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
    }

    // ---------- Actions ----------
    const actions = {
      tab: (el) => { S.tab = el.dataset.tab; render(); },
      'go-friends': () => { S.screen = 'friends'; render(); },
      'go-feed': () => { S.screen = 'feed'; render(); },
      swap: (el) => {
        const id = el.dataset.id;
        S.swapped.has(id) ? S.swapped.delete(id) : S.swapped.add(id);
        render();
      },
      request: (el) => {
        hooks.beforeSend?.([el.dataset.id]);
        sendRequest(userId, el.dataset.id);
        toast(`Close friend request sent to ${users[el.dataset.id].name}`);
      },
      accept: (el) => {
        S.highlight = el.dataset.id;
        acceptRequest(userId, el.dataset.id);
        toast(`★ You and ${users[el.dataset.id].name} are close friends`);
      },
      decline: (el) => declineRequest(userId, el.dataset.id),
      remove: (el) => {
        removeClose(userId, el.dataset.id);
        toast(`Removed ${users[el.dataset.id].name} from close friends`);
      },
      'open-reel': () => openReel(),
      'ob-start': () => { S.onboard = 'pick'; render(); },
      'ob-close': () => { S.onboard = null; render(); },
      'ob-back': () => { S.onboard = 'intro'; render(); },
      'ob-toggle': (el) => {
        const id = el.dataset.id;
        S.picks.has(id) ? S.picks.delete(id) : S.picks.add(id);
        render();
      },
      'ob-send': () => {
        S.sent = [...S.picks];
        S.onboard = 'sent';
        hooks.beforeSend?.(S.sent.filter((id) => st(id) === 'none'));
        S.sent.forEach((id) => {
          if (st(id) === 'incoming') acceptRequest(userId, id);
          else if (st(id) === 'none') sendRequest(userId, id);
        });
        render();
      },
      'ob-done': () => { Object.assign(S, { onboard: null, screen: 'feed', tab: 'close' }); render(); hooks.onboardDone?.(); },
      notif: (el) => route(S.lockNotifs[+el.dataset.i]),
      unlock: () => { Object.assign(S, { locked: false, off: false }); render(); },
    };

    app.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (el && !el.disabled && actions[el.dataset.action]) actions[el.dataset.action](el);
    });

    const unsubscribe = store.subscribe((ev) => {
      if (ev.to === userId && ev.type === 'accept') S.highlight = ev.from;
      render();
      if (ev.to !== userId) return;
      const name = users[ev.from].name;
      if (ev.type === 'request') {
        notify({ title: '★ Close friend request', body: `${name} wants to be close friends. Tap to respond.`, avatar: ev.from, go: 'friends' });
      } else if (ev.type === 'accept' && S.onboard !== 'sent') {
        notify({ title: `★ ${name} accepted your request`, body: "You're close friends now. You'll see each other in the Close Friends tab.", avatar: ev.from, go: 'close' });
      }
    });

    // ---------- Weekly recap reel ----------
    let R = null;

    function buildSlides() {
      const members = circle();
      const slides = [{ type: 'title', dur: 2800 }];
      for (let d = 0; d < 7; d++) {
        const ps = D.posts.filter((p) => p.day === d && members.includes(p.userId)).sort((a, b) => a.minutes - b.minutes);
        if (!ps.length) continue;
        slides.push({ type: 'day', day: d, dur: 1200 });
        ps.forEach((p) => slides.push({ type: 'post', day: d, post: p, dur: 1600 }));
      }
      slides.push({ type: 'end', dur: Infinity });
      return slides;
    }

    function slideHTML(s) {
      const members = circle();
      if (s.type === 'title') {
        const count = D.posts.filter((p) => members.includes(p.userId)).length;
        return `<div class="slide s-title">
          <div class="big-stack">${members.map((id) => img(users[id].avatar)).join('')}</div>
          <div class="eyebrow">Close Friends recap</div>
          <h2>Your week,<br>together.</h2>
          <div class="sub">${D.week.label} · ${members.length} people · ${count} BeReals</div>
        </div>`;
      }
      if (s.type === 'day') {
        return `<div class="slide s-day">
          <div class="day-name">${D.week.days[s.day]}</div>
          <div class="day-date">${D.week.dates[s.day]}</div>
          <div class="btime">⚠️ Time to BeReal · ${fmtTime(D.notifTimes[s.day])}</div>
        </div>`;
      }
      if (s.type === 'post') {
        const p = s.post;
        const u = users[p.userId];
        return `<div class="slide s-post">
          ${img(p.back, 'kb')}
          <div class="shade"></div>
          ${p.front ? img(p.front, 'front') : ''}
          <div class="daychip">${D.week.short[p.day]}</div>
          <div class="info">
            <div class="who-row">
              ${img(u.avatar, 'avatar')}
              <div>
                <div class="pname">${nameOf(u.id)}</div>
                <div class="ptime">${fmtTime(p.minutes)}${p.late ? ` · <span class="late">${lateLabel(p)}</span>` : ' · on time'}</div>
              </div>
            </div>
            ${p.caption ? `<div class="pcap">${p.caption}</div>` : ''}
          </div>
        </div>`;
      }
      const st = weekStats(members);
      return `<div class="slide s-end">
        <h2>That was your week 💚</h2>
        <div class="sub">See you next Sunday.</div>
        <div class="stats">
          <div class="stat"><div class="stat-k">BeReals</div><div class="stat-v">${st.total}</div><div class="stat-s">across 7 days</div></div>
          <div class="stat"><div class="stat-k">Most on time</div><div class="stat-v">${st.onTime.name}</div><div class="stat-s">${st.onTime.n} of 7 days</div></div>
          <div class="stat"><div class="stat-k">Night owl</div><div class="stat-v">${st.owl.name}</div><div class="stat-s">posted at ${fmtTime(st.owl.minutes)}</div></div>
          <div class="stat"><div class="stat-k">Latest</div><div class="stat-v">${st.late.name}</div><div class="stat-s">${st.late.label}</div></div>
        </div>
        <div class="end-actions">
          <button class="btn ghost" data-reel="restart">↺ Watch again</button>
          <button class="btn primary" data-reel="share">Share with circle</button>
        </div>
      </div>`;
    }

    function weekStats(members) {
      const ps = D.posts.filter((p) => members.includes(p.userId));
      const onTimeBy = {};
      ps.forEach((p) => { if (!p.late && p.userId !== userId) onTimeBy[p.userId] = (onTimeBy[p.userId] || 0) + 1; });
      const [otId, otN] = Object.entries(onTimeBy).sort((a, b) => b[1] - a[1])[0] || [userId, 0];
      const owl = ps.reduce((a, b) => (b.minutes > a.minutes ? b : a));
      const late = ps.reduce((a, b) => (b.late > a.late ? b : a));
      return {
        total: ps.length,
        onTime: { name: nameOf(otId), n: otN },
        owl: { name: nameOf(owl.userId), minutes: owl.minutes },
        late: { name: nameOf(late.userId), label: late.late ? `${lateLabel(late)} on ${D.week.days[late.day]}` : 'no one was late!' },
      };
    }

    function openReel() {
      if (R) return;
      const slides = buildSlides();
      const days = [...new Set(slides.filter((s) => s.day != null).map((s) => s.day))];
      const el = document.createElement('div');
      el.className = 'reel';
      el.innerHTML = `
        <div class="reel-stage"></div>
        <div class="reel-progress">${days.map(() => '<div class="seg"><i></i></div>').join('')}</div>
        <div class="reel-top">
          <div class="reel-label">${ICONS.star} Close Friends · ${D.week.label}</div>
          <button class="reel-close" data-reel="close" aria-label="Close">${ICONS.close}</button>
        </div>
        <div class="reel-hint">Paused</div>`;
      screenEl.appendChild(el);
      requestAnimationFrame(() => el.classList.add('open'));
      R = { el, slides, days, i: -1, elapsed: 0, paused: false, last: performance.now() };
      bindReel(el);
      go(0);
      R.raf = requestAnimationFrame(tick);
    }

    function closeReel() {
      if (!R) return;
      cancelAnimationFrame(R.raf);
      const el = R.el;
      R = null;
      el.classList.remove('open');
      setTimeout(() => el.remove(), 300);
    }

    function tick(now) {
      if (!R) return;
      const dt = Math.min(now - R.last, 100);
      R.last = now;
      if (!R.paused) {
        R.elapsed += dt;
        if (R.elapsed >= R.slides[R.i].dur) go(R.i + 1);
      }
      updateProgress();
      R.raf = requestAnimationFrame(tick);
    }

    function go(i) {
      i = Math.max(0, Math.min(R.slides.length - 1, i));
      if (i === R.i) { R.elapsed = 0; return; }
      R.i = i;
      R.elapsed = 0;
      const stage = $('.reel-stage', R.el);
      const old = [...stage.children];
      stage.insertAdjacentHTML('beforeend', slideHTML(R.slides[i]));
      const slide = stage.lastElementChild;
      requestAnimationFrame(() => requestAnimationFrame(() => slide.classList.add('in')));
      old.forEach((o) => { o.classList.remove('in'); setTimeout(() => o.remove(), 400); });
      // Preload the next few photos so the reel never waits on the network.
      R.slides.slice(i + 1, i + 5).forEach((s) => { if (s.post) [s.post.back, s.post.front].filter(Boolean).forEach((src) => { new Image().src = src; }); });
    }

    function updateProgress() {
      const segs = R.el.querySelectorAll('.seg i');
      const cur = R.slides[R.i];
      R.days.forEach((d, k) => {
        const idx = R.slides.map((s, j) => (s.day === d ? j : -1)).filter((j) => j >= 0);
        let frac;
        if (cur.type === 'end') frac = 1;
        else if (cur.type === 'title' || R.i < idx[0]) frac = 0;
        else if (R.i > idx[idx.length - 1]) frac = 1;
        else {
          const total = idx.reduce((a, j) => a + R.slides[j].dur, 0);
          const done = idx.filter((j) => j < R.i).reduce((a, j) => a + R.slides[j].dur, 0) + Math.min(R.elapsed, cur.dur);
          frac = done / total;
        }
        segs[k].style.width = `${frac * 100}%`;
      });
    }

    function bindReel(el) {
      const stage = $('.reel-stage', el);
      let holdTimer = null;
      let held = false;
      stage.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        held = false;
        holdTimer = setTimeout(() => { held = true; R.paused = true; el.classList.add('paused'); }, 220);
      });
      stage.addEventListener('pointerup', (e) => {
        if (e.target.closest('button')) return;
        clearTimeout(holdTimer);
        if (!R) return;
        if (held) { R.paused = false; el.classList.remove('paused'); return; }
        if (R.slides[R.i].type === 'end') return;
        const rect = stage.getBoundingClientRect();
        go(e.clientX - rect.left < rect.width * 0.3 ? R.i - 1 : R.i + 1);
      });
      stage.addEventListener('pointerleave', () => {
        clearTimeout(holdTimer);
        if (held && R) { R.paused = false; el.classList.remove('paused'); }
      });
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-reel]');
        if (!b) return;
        if (b.dataset.reel === 'close') closeReel();
        if (b.dataset.reel === 'restart') go(0);
        if (b.dataset.reel === 'share') toast('Shared with your close friends 💚');
      });
    }

    render();

    // Plays a scripted "tap the request notification, then tap Accept" on this phone.
    function autoAccept(from, onAccepted) {
      const tap = (el, then) => {
        if (!el) return;
        el.classList.add('tapping');
        later(() => { el.classList.remove('tapping'); then(el); }, 450);
      };
      later(() => tap($('.push', screenEl), (el) => el.click()), 1600);
      later(() => tap($(`[data-action="accept"][data-id="${from}"]`, app), (el) => { el.click(); onAccepted?.(); }), 3600);
    }

    return {
      autoAccept,
      el: wrap,
      lock,
      openReel,
      closeReel,
      reelKey(key) {
        if (!R) return false;
        if (key === 'ArrowRight') go(R.i + 1);
        else if (key === 'ArrowLeft') go(R.i - 1);
        else if (key === 'Escape') closeReel();
        else if (key === ' ') { R.paused = !R.paused; R.el.classList.toggle('paused', R.paused); }
        return true;
      },
      show(screen, tab) {
        closeReel();
        Object.assign(S, { locked: false, off: false, onboard: null, screen, tab: tab || S.tab });
        render();
      },
      startOnboarding() {
        closeReel();
        const picks = D.suggested.filter((id) => id !== userId && st(id) !== 'close');
        Object.assign(S, { locked: false, off: false, screen: 'feed', tab: 'all', onboard: 'intro', picks: new Set(picks), sent: [], sentShown: new Set() });
        render();
      },
      pushRecap() {
        notify({ title: 'Your week with Close Friends 🎬', body: `${D.week.label}: ${circle().length} people, 7 days. Tap to watch.`, go: 'reel' });
      },
      reset() {
        closeReel();
        clearPushes();
        Object.assign(S, initial());
        render();
      },
      destroy() {
        unsubscribe();
        closeReel();
        wrap.remove();
      },
    };
  }

  // ---------- Presenter controls (side panel) ----------
  const stageEl = $('.stage');
  const mount = $('#phones');
  // In one-phone mode, sending a close friend request (from onboarding or the Friends
  // screen) brings in the recipient's phone so the audience can watch it get accepted.
  // It slides away again shortly after accepting.
  let guestId = null;
  function showGuest(ids) {
    if (stageEl.classList.contains('two') && !guestId) return;
    if (guestId) removeGuest(false);
    const free = ids.filter((x) => !phones[x]);
    const id = free.includes(D.acceptingPhone) ? D.acceptingPhone : free[0];
    if (!id) return;
    guestId = id;
    stageEl.classList.add('two', 'guest-mode');
    phones[id] = createPhone(id, mount, { guest: true });
    phones[id].autoAccept(D.me.id, () => later(() => { if (guestId === id) removeGuest(); }, 2000));
  }
  function removeGuest(animate = true) {
    if (!guestId) return;
    const p = phones[guestId];
    const id = guestId;
    delete phones[guestId];
    guestId = null;
    // If the phone leaves before its scripted accept, accept off-screen like other friends.
    if (store.status(id, D.me.id) === 'incoming') later(() => acceptRequest(id, D.me.id), 800);
    const finish = () => { p.destroy(); stageEl.classList.remove('guest-mode'); if (!phones[D.secondPhone]) stageEl.classList.remove('two'); };
    if (animate) { p.el.classList.add('leaving'); setTimeout(finish, 400); } else finish();
  }

  phones[D.me.id] = createPhone(D.me.id, mount, { beforeSend: showGuest, onboardDone: () => removeGuest() });
  const main = phones[D.me.id];

  function setPhones(two) {
    removeGuest(false);
    const id = D.secondPhone;
    stageEl.classList.toggle('two', two);
    if (two && !phones[id]) phones[id] = createPhone(id, mount);
    if (!two && phones[id]) { phones[id].destroy(); delete phones[id]; }
    document.querySelectorAll('[data-demo^="phones"]').forEach((b) => b.classList.toggle('active', b.dataset.demo === (two ? 'phones2' : 'phones1')));
  }

  const demo = {
    phones1: () => setPhones(false),
    phones2: () => setPhones(true),
    // The intro is a first-run prompt, so replaying it starts over with no close friends.
    onboard: () => demo.reset(),
    // Same as tapping "Not now": no close friends get added.
    skip: () => main.show('feed', 'all'),
    friends: () => main.show('friends'),
    closeTab: () => main.show('feed', 'close'),
    lockOnTime: () => main.lock('ontime'),
    lockLate: () => main.lock('late'),
    notify: () => { main.show('feed', 'close'); main.pushRecap(); },
    reel: () => { main.show('feed', 'close'); main.openReel(); },
    reset: () => {
      removeGuest(false);
      clearTimers();
      store.reset();
      Object.values(phones).forEach((p) => p.reset());
      main.startOnboarding();
    },
  };
  document.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => {
    if (!/^(phones|reset|onboard)/.test(b.dataset.demo)) removeGuest();
    demo[b.dataset.demo]();
  }));

  document.addEventListener('keydown', (e) => {
    const handled = Object.values(phones).some((p) => p.reelKey(e.key));
    if (handled && e.key === ' ') e.preventDefault();
  });

  // The demo opens on the in-app Close Friends announcement.
  later(() => main.startOnboarding(), 700);
})();
