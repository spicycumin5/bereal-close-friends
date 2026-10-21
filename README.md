# BeReal: Close Friends (concept demo)

A clickable phone mockup pitching a **Close Friends** feature for BeReal:

1. **Mutual close friend requests:** send one from the Friends screen; they accept.
2. **Close Friends tab:** a filter on the existing feed, not separate posts.
3. **Weekly recap:** every Sunday, a chronological reel of the circle's BeReals, Monday → Sunday.

Plain HTML/CSS/JS with no build step.

## Run locally
Open `index.html` in a browser, or serve it:

```
npx serve .
```

## Live demo
https://bereal-close-friends.vercel.app

## Deploys
The Vercel project is connected to this GitHub repo: every push to `main` deploys to production automatically, and pushes to other branches get preview URLs. There is no build step.

After editing `app.js`, `data.js` or `styles.css`, bump the `?v=` number on their links in `index.html` so browsers don't keep a stale cached copy.

## Presenting
- The demo opens with the in-app Close Friends announcement, followed by the suggested-friends picker.
- On desktop, the left panel has shortcuts for each step: replay or skip onboarding, open Friends, jump to the Close Friends tab, turn the phone off (lock-screen notifications as close friends post on time or late), send the Sunday push notification, play the recap, and reset.
- When Kyumin sends a close friend request, the recipient's phone (Evan's after onboarding) slides in, receives the notification, accepts it, and slides away. Other friends accept automatically after a moment.
- Tap a photo to swap front and back cameras.
- Recap: tap the right side to skip, the left side to go back, hold to pause. Keyboard: ← → Space Esc.
- On a phone, the frame is dropped and the demo fills the screen.

## Your own photos
See `photos/README.md`. Stock images come from picsum.photos (scenes) and pravatar.cc (faces), so viewing needs an internet connection.
