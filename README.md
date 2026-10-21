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

## Deploy to Vercel
- **CLI:** run `npx vercel` in this folder (choose "Other" as the framework, no build command), then `npx vercel --prod`.
- **Git:** push this folder to a GitHub repo and import it at vercel.com/new. Leave the build settings empty.

## Presenting
- The demo opens with the in-app Close Friends announcement, followed by the suggested-friends picker.
- On desktop, the left panel has shortcuts for each step: replay or skip onboarding, open Friends, jump to the Close Friends tab, turn the phone off (lock-screen notifications as close friends post on time or late), send the Sunday push notification, play the recap, and reset.
- **Two phones** shows Jordan's phone next to Alex's. A close friend request sent from either phone arrives as a notification on the other, and accepting it notifies the sender. Friends without a phone on screen accept automatically after a moment.
- Tap a photo to swap front and back cameras.
- Recap: tap the right side to skip, the left side to go back, hold to pause. Keyboard: ← → Space Esc.
- On a phone, the frame is dropped and the demo fills the screen.

## Your own photos
See `photos/README.md`. Stock images come from picsum.photos (scenes) and pravatar.cc (faces), so viewing needs an internet connection.
