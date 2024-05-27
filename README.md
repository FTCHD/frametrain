# 🚂 FrameTrain

https://github.com/FTCHD/frametrain/assets/144691102/6c901347-1a28-4a25-93f5-c6bc54076d5a

### FrameTrain is Canva for Farcaster Frames.
- Open Source
- Revenue Sharing
- Integrated Farcaster Hub APIs, so you can just build™️

This repository is mostly geared towards template artists. If you're looking to create and posts Frames, visit [FrameTrain.](https://frametra.in)

# Templates
![Farcaster Frames Templates](https://raw.githubusercontent.com/FTCHD/frametrain/main/.github/templates.png)
Templates live in the **`@/templates`** folder. Each template follows a clear folder structure:

- `functions` — a collection of 1 or more handlers, used as controllers for displaying the `views`. Must contain at least an `initial` handler.
- `views` — a collection of 1 or more React components, rendered as the Frames’ image using `satori`. Must contain at least a `Cover` view.
- `Inspector` — a React component displayed in the Frame Editor. Used to get input from the user, transform it as needed and saving it as the Frame’s config. This config will be used by the **`functions`** to properly display the `views`.
- `cover` — a cover image for the template, displayed in the template selection screen.

Everything else is completely up to you. You can have a `hooks`, `types`, `utils`, or an `assets` folder if you want.

# Integrated Hub API
FT validates each message without requiring template creators to integrate external APIs. In order to enable message validation for your template, just set the **`requireValidation`** flag in the template config.

Right now, the API provider used is Neynar. Neynar requests seem cheap at first, but having hundreds or thousands of Frames making requests hasn't been tested.

The choice stands between an internal Hub run by FT, continuing to use Neynar, or switching to Airstack. It’s not clear right now which option is the right one. Reach out if you have any suggestions!

# Revenue Sharing (WIP)
![Farcaster Revenue Sharing](https://raw.githubusercontent.com/FTCHD/frametrain/main/.github/monetize.png)

Currently all templates have been create internally, and hosting Frames is free.

Soon you will be able to subscribe and host your Frames with no imposed limits (as opposed to the always free tier which would have some limits). The revenue from subscriptions will be shared with template creators, depending on usage.

Usage is counted as calls coming from a Farcaster client to any of the template’s **`functions`**. The more Farcaster users interact with a Frame, the more its template creator earns.

At the end of the month, costs are subtracted, the number of calls are added to calculate a ratio, and each creator is rewarded.

This part is still a WIP, and the train has to run for a bit in order to make further decisions on the exact mechanism.

# Included APIs

### Functions 
- `validate`
- `upload` 
- `scrape` 
    - Call this in your Inspector or functions to get the contents of a webpage.
    - Pass `readability` to true to convert it to readability
    - Pass `markdown` to true to convert it to markdown

### Hooks
- `useFrameId`
- `useFrameConfig`
- `useImageUpload`

# Contributing
Thank you for considering making FrameTrain better.

The project currently needs help with:

- TS Generics. I skipped **[generics class](https://www.youtube.com/watch?v=ATdXeuQh_Ws&t=1m40s)** and I've tried implementing them but it always leads to spaghetti. The base template types should be generics based on the initial config received, this would make everything much more cleaner and modular.
- Bug Fixes & More. If you see something that sucks, and you know how to do it better, open a PR and let’s see that confidence. It would be really appreciated actually.

For a good experience, please install the Biome extension. This repository uses Biome, not ESLint.