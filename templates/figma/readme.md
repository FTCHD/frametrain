# FramePress

Turn your Figma designs into interactive experiences!

## Figma Personal Access Token

You'll note that there is an input field for the user to enter their Figma PAT.

This is because we need to fetch the Figma design to generate previews and update some client-side config using the Figma API, but the Figma API requires a PAT. I obviously don't want to expose *my* PAT to users of the template on the client-side, so I require the template users to provide their own PAT.

One downside of this approac is that the client-side renders the SVG directly, whereas the frame is rendered server-side and depends on fonts being loaded, which might mean the frames don't render 100% the same if there are font issues.

An alternative server-side design would require FrameTrain to support internal API routes in a template. Then FrainTrain could use a single PAT, their own, in the internal API without exposing their PAT on the client side. FT would need to verify that such usage would not violate the Figma T&Cs. The existence of such a Figma API proxy could also be abused.

Given the time constraints of the hackathon, I chose the client-side route for expedience.


## Limitations

- Font loading performance is dismal; I'm not sure if there is a way to cache between requests
    - I implemented exact font/weight/style loading and it didn't seem to help much, not enough time to investigate why

## Outstanding

- Bug: slide params are empty despite being in the URL (possibly an FT bug?)
- Bug: update config should be debounced otherwise rapid config updates get lost (should be addressed at FT-level?)
- Feature: justify text horizontally (based on `experimental_FigmaImageReponse`)
- Performance: show a font dialog rather with a single font picker rather than multiple pickers on the page
- Performance: add a checkbox to enable overrides to reduce config size