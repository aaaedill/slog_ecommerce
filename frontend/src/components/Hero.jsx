
import React from "react";
import hero_img from "../assets/hero_img.webp";

/**
 * HeroNew
 *
 * Optional prop `mobileSrc`: a portrait-cropped version of the hero image
 * (e.g. 1080x1350). Not needed for the current image - SLOG and the model
 * are both centred, so the standard crop already keeps them fully visible.
 *
 *   import hero_mobile from "../assets/hero_mobile.png";
 *   <HeroNew mobileSrc={hero_mobile} />
 *
 */
const HeroNew = ({ mobileSrc }) => {
  return (
    <>
      <style>{`
        /*
          Image facts (hero_img.png, 1672x941, 16:9):
            - SLOG wordmark spans 29%–70% of the width, 15%–36% of the height
            - The model is centred at ~50% and runs off the bottom edge
          So the focal point is always x = 50%, and on narrow screens the
          hero height is limited so the visible slice (about 50% of the
          width) always contains the whole SLOG name with a margin.
        */
        .hn-root {
          --hn-nav: var(--nav-h, 76px);   /* matches the Navbar height */
          --hn-x: 50%;
          --hn-y: 12%;                     /* keeps SLOG in view if height is cropped */
          --hn-radius: clamp(16px, 3vw, 40px);

          position: relative;
          width: 100%;

          /* Fallback for browsers without svh */
          height: calc(100vh - var(--hn-nav));

          /* Full screen on desktop/laptop. On portrait screens (phones,
             tablets) the 108vw cap makes the image scale to the hero's
             height, so only the plain dark sides are trimmed. */
          height: min(calc(100svh - var(--hn-nav)), 108vw);
          max-height: 1500px;

          overflow: hidden;
          background: #0c0d08;           /* matches the photo's dark backdrop */
          line-height: 0;

          clip-path: inset(0 0 0 0 round 0);
          animation: hn-frame 1.4s cubic-bezier(0.22, 0.8, 0.2, 1) backwards;
        }

        .hn-root picture {
          display: block;
          width: 100%;
          height: 100%;
        }

        .hn-root img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: var(--hn-x) var(--hn-y);

          /* The image rests untouched after the intro, so full quality
             is preserved. */
          animation: hn-zoom 2s cubic-bezier(0.22, 0.8, 0.2, 1) backwards;
          will-change: transform;
        }

        /* Frame opens up from a rounded card to full width */
        @keyframes hn-frame {
          from {
            clip-path: inset(7% 7% 7% 7% round var(--hn-radius));
          }
          to {
            clip-path: inset(0% 0% 0% 0% round 0px);
          }
        }

        /* Image settles in with a gentle zoom-out and brightness fade */
        @keyframes hn-zoom {
          from {
            transform: scale(1.18);
            filter: brightness(1.22);
          }
          to {
            transform: scale(1);
            filter: brightness(1);
          }
        }

        /* Tablets and below: navbar is shorter, frame corners smaller */
        @media (max-width: 1023px) {
          .hn-root {
            --hn-nav: var(--nav-h, 64px);
            --hn-radius: 24px;
          }
        }

        @media (max-width: 480px) {
          .hn-root {
            --hn-radius: 16px;
          }
        }

        /* Ultrawide screens: let the hero follow a 20:9 shape instead of
           being cropped, so SLOG and the model's face stay in frame */
        @media (min-width: 1600px) and (min-aspect-ratio: 20/9) {
          .hn-root {
            height: auto;
            aspect-ratio: 20 / 9;
            max-height: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hn-root,
          .hn-root img {
            animation: none;
          }
        }
      `}</style>

      <section className="hn-root" aria-label="SLOG hero">
        <picture>
          {mobileSrc && (
            <source media="(max-width: 767px)" srcSet={mobileSrc} />
          )}

          <img
            src={hero_img}
            alt="SLOG — 2021 fashion collection"
            decoding="async"
            draggable="false"
          />
        </picture>
      </section>
    </>
  );
};

export default HeroNew;