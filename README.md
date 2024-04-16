### FrameTrain is Canva for Farcaster Frames.

- Open Source
- Revenue Sharing
- Integrated Farcaster Hub APIs, so you can just build™️

# Templates

Templates live in the **`templates`** folder. Each template follows a clear starting folder structure:

- `functions` — a collection of 1 or more handlers, used as controllers for displaying the `views`. Must contain at least an `initial` handler.
- `views` — a collection of 1 or more React components, rendered as the Frames’ image using `satori`. Must contain at least a `Cover` view.
- `Inspector` — a React component displayed in the Frame Editor. Used to get input from the** user, transform it as needed and saving it as the Frame’s config. This config will be used by the **`functions`** to properly display the `views`.
- `cover` — a cover image for the template, used in the template selection screen.
# Integrated Hub API

FT validates each message without requiring template creators to integrate any APIs. In order to enable message validation for your template, just set the **`requireValidation`** flag in the template config.

Right now, the API provider used is Neynar. Neynar requests seem (and are) cheap at first, but having hundreds or thousands of Frames making requests hasn't been modeled.

The choice stands between an internal Hub run by FT, continuing to use Neynar, or switching to Airstack. It’s not clear right now which option is the right one.

If Neynar or Airstack want to reach out and provide a solution where everyone wins, I'm all ears!

# Revenue Sharing

Currently all FT templates have been created by me, so I would be sharing revenue with myself. 

Soon you will be able to subscribe and host your Frames with no imposed limits (as opposed to the free tier which would have limits).

The lack of such functionality is intentional, as requiring a subscription day 1 would make the service dead on arrival. The functionality to count usage is implemented though.

Usage is counted as calls coming from a Farcaster client to any of the template’s **`functions`**. The more a Frame that uses a template is interacted with, the more that template creator earns.

The revenue from subscriptions will be shared with the template creators, depending which templates were used during that month.

At the end of the month, costs are subtracted, the number of calls are added to calculate a ratio, and each creator is rewarded accordingly.

This part is still a WIP, and the platform has to run for a bit for us to collect useful data and make further decisions on the exact mechanism.

# Included APIs

- `validate`
- `upload` (wip)
- `scrape` (wip)
    - Call this in your Inspector or functions to get the contents of a webpage.
    - Pass `readability` to true to convert it to readability
    - Pass `markdown` to true to convert it to markdown

# Contributing

Thank you for considering making FrameTrain better.

The project currently needs help with (in order of importance):

- TS Generics. I skipped **[generics class](https://www.youtube.com/watch?v=ATdXeuQh_Ws&t=1m40s)** and I've tried implementing them but it always leads to spaghetti. I know, I feel the shame and disgust too, maybe you’re the chad that knows how to solve this. The base template types should be generics, this would make everything much more cleaner and modular.
- Image Uploading. This would require calculating the storage costs of each user each month, and subtract that from the revenue. It hasn’t been implemented yet, and I’m still thinking if there aren’t better ways for this. Contenders for hosting are Cloudflare or Pinata.
- Template Versioning. Users should be able to choose if they want to update to a new version of the template. This requires some changes in how templates currently work.
- Bug Fixes & More. If you see something that sucks, and you know how to do it better, open a PR and let’s see that confidence. I would really appreciate it actually.

For a good experience, please install the Biome extension. This repository uses Biome, not ESLint.

# Gotchas

The FT app is deployed on Cloudflare Pages. This means everything is running on the **`edge`** runtime. Node specific stuff does not run, not that you will actually encounter issues if you know what you’re doing.
