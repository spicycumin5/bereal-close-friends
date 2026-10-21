# Photos

Each person with real photos has three files, all cropped from BeReal screenshots:

- `<name>-back.jpg`: main camera, 900x1200 (3:4)
- `<name>-front.jpg`: selfie camera, 900x1200 (3:4)
- `<name>-avatar.jpg`: square face crop used as their profile picture, 320x320

`REAL_PHOTOS` at the top of `data.js` maps each person to their file prefix. Their profile picture becomes the face crop, and their Sunday ("today") BeReal uses the back and front photos. Everyone else uses stock images.

To add someone, crop the 3:4 photo out of a screenshot (on an iPhone 1170x2532 screenshot, the photo sits at x 30-1140, y 333-1813), save the three files, and add them to `REAL_PHOTOS`. The original `.PNG` screenshots are git-ignored.
