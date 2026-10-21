# Your photos

Drop your own images in this folder, then point `data.js` at them:

- **Avatars / selfies:** set a friend's `avatar` (e.g. `avatar: 'photos/aimee.jpg'`). By default the avatar is also used as that person's front-camera selfie.
- **Individual BeReals:** add entries to `POST_OVERRIDES` keyed by `<userId>-<day>` (Mon = 0, Sun = 6):

```js
const POST_OVERRIDES = {
  'aimee-6': { back: 'photos/aimee-sun-back.jpg', front: 'photos/aimee-sun-front.jpg', caption: 'sunday reset' },
};
```

Portrait 3:4 images (e.g. 900x1200) look best.
