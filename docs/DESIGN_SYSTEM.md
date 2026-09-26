# Raahi experience design

The pre-redesign version is preserved at `6ad2041` on `codex/raahi-core`. UI work starts on `codex/raahi-experience`; the engine, API and persisted data contract are unchanged.

## Direction

A coastal travel desk: warm ivory `#f8f7f3`, deep teal `#164d47`, ink `#233d39`, muted foliage, sand and restrained amber for disruption evidence. Manrope supports product headings, DM Sans controls/data, and Instrument Serif adds an editorial accent to destination headings. A continuous route-inspired R and destination dot replace the stock compass.

The destination hero compresses when recovery becomes the task. Cards foreground cash, concert time and rest. Secondary financial details are expandable; already-paid loss stays distinct from cash. On mobile, sticky section controls switch between recovery and itinerary. Review is a native accessible dialog with independently scrolling content and a persistent total/action footer. Reduced-motion settings disable animation.

Reference principles, not copied assets or layouts: [Flighty](https://flighty.com/) for clear disruption status; [Linear](https://linear.app/) for hierarchy and restraint; [Wanderlog](https://wanderlog.com/) for itinerary context alongside planning. Two parallel agents reviewed visual references and UX; one implemented the bounded card/review component changes.

## Project artwork

- `public/images/goa-coast.png`: original generated destination image, created with the built-in image generation tool. Decorative Goa-inspired artwork; it is not evidence of an actual property, booked hotel or current weather.
- `src/components/brand.tsx` and `src/app/icon.svg`: native vector logo and favicon, authored in code.

### Final image prompt

Use case: photorealistic-natural. Create an original premium editorial travel photograph for a travel recovery web application named Raahi. Wide landscape 1536x1024. Goa-inspired Indian coastline seen from a low drone: a graceful crescent of quiet pale sand curving along turquoise Arabian Sea, lush coconut palms and laterite rocks on the right, a tiny terracotta-roof coastal house discreetly among trees. Late afternoon honey light, sea mist in far distance, natural subtle film texture, beautiful muted ocean teal and warm sand color palette, realistic water and foliage, refined magazine travel photography. Composition: shoreline curves from lower right into distant upper middle; the left third is mostly deep turquoise open water with few details, allowing white website text on a dark overlay. No people close up, no boats in foreground, no text, no lettering, no logo, no watermark, no UI. Image is destination mood illustration, not documentation of a specific real booking or property.

## Validation boundary

Run the production build and one integrated browser journey, then inspect desktop, laptop and mobile views, modal behavior, navigation and overflow. Do not repeat engine unit tests for this presentation-only milestone unless engine behavior changes. Record observed results in `docs/VERIFICATION.md`.
