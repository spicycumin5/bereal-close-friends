# Photos

Each person with real photos has three files, all cropped from BeReal screenshots:

- `<name>-back.jpg`: main camera, 900x1200 (3:4)
- `<name>-front.jpg`: selfie camera, 900x1200 (3:4)
- `<name>-avatar.jpg`: their BeReal profile picture, cut from the round avatar in the screenshot header (x 261-353, y 161-253), 192x192

`REAL_PHOTOS` at the top of `data.js` maps each person to their file prefix. Their profile picture is the avatar, their Sunday ("today") BeReal uses the back and front photos, and other days use their real selfie in the inset. Everyone else uses stock images.

To add someone, crop the 3:4 photo out of a screenshot (on an iPhone 1170x2532 screenshot, the photo sits at x 30-1140, y 333-1813), save the three files, and add them to `REAL_PHOTOS`. The original `.PNG` screenshots are git-ignored.
