HERO (landing page background, index.html)

Drop here:  hero.jpg
One wide landscape image, minimum 2400px wide (2400x1600 / 3:2 is ideal;
16:9 also fine). It fills the full first screen behind the headline with a
dark overlay, and is cropped from the centre on phones, so keep the key
subject near the middle and avoid important detail at the edges.
Aim for under 600 KB after compression.

The landing hero is served as a WebP with a JPG fallback via <picture> in
index.html: assets/img/hero.webp (shown to modern browsers) and
assets/img/hero.jpg (fallback). Keep BOTH in sync. After replacing
assets/img/hero.jpg, regenerate the WebP:

  cwebp -q 90 -m 6 assets/img/hero.jpg -o assets/img/hero.webp

Optional: hero-poster.jpg, a still frame shown before assets/hero.mp4 loads
in the showroom section video (landscape, 1920x1080).
