# Complete Media Optimization Guide: Videos & Images for High-Performance Web

> **Target Goal**: Transform media-heavy web applications from sluggish, high-bandwidth sites (30MB–60MB+ initial transfer) into ultra-fast, smooth, 60fps experiences with instant First Contentful Paint (FCP), sub-1.5s Largest Contentful Paint (LCP), 0 Cumulative Layout Shift (CLS), and negligible memory footprint.

---

## Table of Contents
1. [Core Web Vitals & Performance Impact](#1-core-web-vitals--performance-impact)
2. [Image Optimization Strategies](#2-image-optimization-strategies)
   - [Next-Gen Image Formats (AVIF & WebP)](#next-gen-image-formats-avif--webp)
   - [Responsive Images with `srcset` and `sizes`](#responsive-images-with-srcset-and-sizes)
   - [Modern Loading Attributes (`loading`, `decoding`, `fetchpriority`)](#modern-loading-attributes)
   - [Preventing Layout Shift (CLS)](#preventing-layout-shift-cls)
   - [Placeholders & Perceived Speed (BlurHash, LQIP, Skeleton)](#placeholders--perceived-speed)
3. [Video Optimization Strategies](#3-video-optimization-strategies)
   - [Codecs & Formats (AV1, VP9/WebM, H.264/MP4)](#codecs--formats)
   - [Stripping Audio & Faststart (Moov Atom Placement)](#stripping-audio--faststart-moov-atom-placement)
   - [Why Blob Preloading is Harmful & How HTTP Range Requests Work](#why-blob-preloading-is-harmful--how-http-range-requests-work)
   - [Adaptive Bitrate Streaming (HLS & DASH)](#adaptive-bitrate-streaming-hls--dash)
   - [Smart Viewport Loading with IntersectionObserver](#smart-viewport-loading-with-intersectionobserver)
   - [Poster Frames & First Frame Stutters](#poster-frames--first-frame-stutters)
4. [Delivery & Infrastructure Architecture](#4-delivery--infrastructure-architecture)
   - [Image & Video CDNs](#image--video-cdns)
   - [HTTP Cache Headers & Immutable Assets](#http-cache-headers--immutable-assets)
5. [React-Specific Implementation Patterns](#5-react-specific-implementation-patterns)
   - [Optimized `<SmartImage />` Component](#optimized-smartimage--component)
   - [Optimized `<LazyVideo />` Component](#optimized-lazyvideo--component)
6. [Automated CLI Commands & Scripts (FFmpeg & Sharp)](#6-automated-cli-commands--scripts-ffmpeg--sharp)
7. [Priority Action Plan & Audit Matrix](#7-priority-action-plan--audit-matrix)

---

## 1. Core Web Vitals & Performance Impact

When a site hosts multiple high-res images and autoplaying videos, unoptimized assets directly destroy user retention and search engine rankings:

| Metric | Threshold | Media Problem | Solution |
| :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | $\le 2.5\text{s}$ | Massive hero images or large MP4 blobs blocking render | High-priority WebP/AVIF poster with `fetchpriority="high"` |
| **CLS** (Cumulative Layout Shift) | $\le 0.1$ | Media rendering without predefined dimensions pushes content | Aspect-ratio containers and explicit `width`/`height` |
| **INP** (Interaction to Next Paint) | $\le 200\text{ms}$ | CPU/GPU decoding stalls main thread; RAM exhaustion causes dropped frames | Pause off-screen video decoders; decode images off main thread (`decoding="async"`) |
| **Data Waste & Thermal Throttling** | N/A | Mobile users download 15MB+ videos and burn battery decoding 1080p video | Stream 540p/720p on mobile, strip unused audio tracks, lazy load |

---

## 2. Image Optimization Strategies

### Next-Gen Image Formats (AVIF & WebP)

Older formats like standard JPEG and PNG carry unnecessary metadata and outdated compression algorithms:
- **AVIF**: 50% smaller than JPEG with superior color fidelity and shadow preservation.
- **WebP**: 30%–40% smaller than JPEG with widespread browser support (>97%).
- **SVG**: For vector graphics, logos, and UI icons. Always run through [SVGO](https://github.com/svg/svgo).

#### HTML `<picture>` Fallback Pattern:
```html
<picture>
  <!-- Modern browsers: AVIF first -->
  <source srcset="/assets/hero_city.avif" type="image/avif" />
  <!-- Fallback to WebP -->
  <source srcset="/assets/hero_city.webp" type="image/webp" />
  <!-- Universal fallback to optimized JPEG/PNG -->
  <img 
    src="/assets/hero_city.jpg" 
    alt="Cyberpunk City Skyline" 
    width="1920" 
    height="1080" 
    loading="lazy" 
    decoding="async" 
  />
</picture>
```

---

### Responsive Images with `srcset` and `sizes`

Serving a 1920px wide image to a 390px mobile viewport wastes over 80% of downloaded bandwidth.

```html
<img
  src="/assets/hero_city-800.webp"
  srcset="
    /assets/hero_city-480.webp 480w,
    /assets/hero_city-800.webp 800w,
    /assets/hero_city-1200.webp 1200w,
    /assets/hero_city-1920.webp 1920w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px"
  alt="Project Showcase"
  loading="lazy"
  decoding="async"
  width="1200"
  height="675"
/>
```
* **`srcset`**: Informs the browser about available image resolutions and their widths in pixels.
* **`sizes`**: Informs the browser what width the image will occupy at different viewport breakpoints *before* CSS finishes downloading.

---

### Modern Loading Attributes

Apply attributes based on whether the image is in the **initial viewport (Above-the-Fold)** or **down the page (Below-the-Fold)**:

#### 1. Above-the-Fold (Hero / LCP Candidate):
```html
<img 
  src="/assets/hero_city.webp" 
  alt="Hero banner" 
  fetchpriority="high" 
  loading="eager" 
  decoding="async" 
  width="1920" 
  height="1080"
/>
```
* `fetchpriority="high"`: Tells browser's network scheduler to prioritize this request over scripts and low-priority assets.
* **Never use `loading="lazy"` on above-the-fold hero images**; it delays LCP by 200ms–800ms!

#### 2. Below-the-Fold (Cards, galleries, team photos):
```html
<img 
  src="/assets/service_meme.webp" 
  alt="Service icon" 
  loading="lazy" 
  decoding="async" 
  width="600" 
  height="400"
/>
```
* `loading="lazy"`: Defers network fetch until the element is close to the viewport.
* `decoding="async"`: Decodes image in a background thread without locking main thread UI animations.

---

### Preventing Layout Shift (CLS)

Images loading without aspect ratios cause sudden jumps in content.

1. **Always provide HTML width and height attributes**:
   ```html
   <img src="photo.webp" width="800" height="600" class="w-full h-auto" />
   ```
2. **Or use CSS `aspect-ratio`**:
   ```css
   .media-card-img {
     width: 100%;
     aspect-ratio: 16 / 9;
     object-fit: cover;
     background-color: #1a1a1e; /* placeholder skeleton color while loading */
   }
   ```

---

### Placeholders & Perceived Speed

1. **Skeleton / Solid Background**: Set a dark/neutral background color matching the dominant image tone (`background-color: #18181b`) so empty boxes look intentional.
2. **LQIP (Low Quality Image Placeholder)**: A tiny 20px wide base64 image scaled up with CSS `filter: blur(20px)`.
3. **BlurHash / ThumbHash**: Compact string encoding (~20–30 bytes) decoded into a smooth canvas blur before full image loads.

---

## 3. Video Optimization Strategies

### Codecs & Formats

Videos should never be served as a single, uncompressed MP4. Serve modern codecs in order of efficiency:

```html
<video autoplay loop muted playsinline poster="/assets/video-poster.webp">
  <!-- 1. AV1: Best compression (~30-50% smaller than H.264) -->
  <source src="/videos/hero.av1.mp4" type="video/mp4; codecs=av01.0.05M.08" />
  <!-- 2. VP9 / WebM: Excellent compression, widespread Android/Desktop support -->
  <source src="/videos/hero.webm" type="video/webm" />
  <!-- 3. H.264 / MP4: Universal fallback for older iOS Safari / legacy browsers -->
  <source src="/videos/hero.mp4" type="video/mp4" />
</video>
```

#### Codec Comparison:
| Codec | Extension | Compression Efficiency | Browser Compatibility |
| :--- | :--- | :--- | :--- |
| **AV1** | `.mp4` or `.webm` | Ultra-High (~50% smaller than H.264) | Chrome, Firefox, Safari 17+ (M3/iPhone 15 Pro) |
| **VP9** | `.webm` | High (~35% smaller than H.264) | All major modern desktop & mobile browsers |
| **H.264 (AVC)** | `.mp4` | Baseline | 100% universal compatibility |

---

### Stripping Audio & Faststart (Moov Atom Placement)

For ambient/background autoplaying video loops:
1. **Strip Audio (`-an`)**: Even silent audio tracks add 10%–25% of redundant bandwidth.
2. **Moov Atom Placement (`-movflags +faststart`)**: 
   - By default, MP4 puts index metadata at the *end* of the file.
   - If not moved to the front, the browser must wait until the **entire video finishes downloading** before starting playback.
   - `+faststart` shifts the index to the beginning, enabling playback within milliseconds of the first bytes arriving.

---

### Why Blob Preloading is Harmful & How HTTP Range Requests Work

> [!CAUTION]
> **Anti-Pattern**: Fetching a 15MB video as an `XMLHttpRequest` / `fetch` blob into memory (`xhr.responseType = 'blob'`).

#### Why XHR/Fetch Blob Preloading Fails:
1. **Blocks First Paint**: The browser waits until all 15MB are in RAM before instantiating the Blob URL.
2. **RAM Exhaustion on Mobile**: Holding 5 to 10 video blobs in mobile memory can crash Safari/Chrome tabs due to memory limits (Jetsam on iOS).
3. **Wasted Mobile Data**: If a user leaves the page after 2 seconds, they already downloaded the entire 15MB file.
4. **Disables Native Browser Optimizations**: Browsers naturally pipeline media through hardware video decoders using HTTP chunking.

#### The Correct Standard: HTTP Range Requests (`206 Partial Content`)
When you supply `<video src="...">`, the browser automatically requests small byte ranges:
- Request header: `Range: bytes=0-1048575` (only fetches the first 1MB to start playing instantly).
- Server response: `HTTP/2 206 Partial Content` with `Content-Range: bytes 0-1048575/15686480`.
- The browser fetches more chunks as the video progresses.

> [!TIP]
> Ensure your web server or CDN sends the `Accept-Ranges: bytes` header. Vercel, Netlify, Cloudflare, and Nginx support this natively for static files.

---

### Adaptive Bitrate Streaming (HLS & DASH)

For long videos or large libraries (>10–30 seconds):
- Convert video into an **HLS (`.m3u8`)** playlist with segmented chunks (`.ts` or fragmented `.mp4`).
- Mobile 4G users receive 480p/720p chunks; desktop gigabit users receive 1080p/4K chunks.
- Automatically adjusts video quality in real-time as network fluctuates, eliminating buffering spinners.
- Open-source player libraries: `hls.js` or `video.js`.

---

### Smart Viewport Loading with IntersectionObserver

Never run 10 videos playing simultaneously in hidden sections of the page. This drains CPU, GPU, battery, and network connections.

**Rules for Multiple Videos**:
1. Set `preload="none"` or `preload="metadata"` for below-the-fold videos.
2. Observe video elements with `IntersectionObserver`.
3. When inside the viewport: attach `src` (or call `video.play()`).
4. When scrolled out of view: call `video.pause()` to release hardware decoder threads.

---

### Poster Frames & First Frame Stutters

Every video tag should include a lightweight WebP/AVIF `poster`:
```html
<video 
  poster="/assets/posters/herovid1_poster.webp" 
  preload="metadata" 
  playsinline 
  muted 
  loop
>
  <source src="/videos/herovid1.mp4" type="video/mp4" />
</video>
```
**Benefits**:
- Instant visual feedback: zero blank black boxes while the video stream establishes.
- Contributes immediately to LCP without waiting for video decoding.
- Can be preloaded in `<head>`:
  ```html
  <link rel="preload" as="image" href="/assets/posters/herovid1_poster.webp" fetchpriority="high" />
  ```

---

## 4. Delivery & Infrastructure Architecture

### Image & Video CDNs

Instead of manually generating 20 variations of every video and image, an Image/Video CDN (Cloudinary, ImageKit, Cloudflare Stream, BunnyCDN, Bunny.net) transforms media on the fly via query parameters.

**Example Dynamic URL (ImageKit / Cloudinary style)**:
```
https://ik.imagekit.io/your_org/hero_city.jpg?tr=w-800,f-auto,q-80
```
- `f-auto`: Automatically detects browser support and returns AVIF to Chrome/Safari and WebP to older browsers.
- `w-800`: Dynamically resizes down to 800px on the edge edge node.
- `q-80`: Applies smart perceptual compression.

---

### HTTP Cache Headers & Immutable Assets

Static media files should be cached permanently on user devices and edge nodes.

#### Vercel `vercel.json` Example:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/videos/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Accept-Ranges",
          "value": "bytes"
        }
      ]
    }
  ]
}
```

---

## 5. React-Specific Implementation Patterns

### Optimized `<SmartImage />` Component

A drop-in component providing lazy loading, native fallback, layout shift prevention, and smooth fade-in.

```jsx
import React, { useState } from 'react';

export default function SmartImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  aspectRatio = '16/9'
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Derive WebP / AVIF filenames or use CDN transforms
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const avifSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');

  return (
    <div
      className={`relative overflow-hidden bg-neutral-900 ${className}`}
      style={{ aspectRatio }}
    >
      <picture>
        <source srcSet={avifSrc} type="image/avif" />
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </div>
  );
}
```

---

### Optimized `<LazyVideo />` Component

A robust video component that:
1. Displays a poster immediately.
2. Only loads video source when near viewport using `IntersectionObserver`.
3. Pauses playback when user scrolls away (saves battery and GPU cycles).
4. Cleans up memory on unmount.

```jsx
import React, { useRef, useEffect, useState } from 'react';

export default function LazyVideo({
  webmSrc,
  mp4Src,
  poster,
  className = '',
  aspectRatio = '16/9'
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Preload video when within 200px of viewport
          setShouldLoad(true);
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Autoplay policy fallback
            });
          }
        } else {
          // Pause when offscreen to conserve memory/CPU
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-neutral-900 ${className}`}
      style={{ aspectRatio }}
    >
      <video
        ref={videoRef}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className="w-full h-full object-cover"
      >
        {shouldLoad && (
          <>
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            {mp4Src && <source src={mp4Src} type="video/mp4" />}
          </>
        )}
      </video>
    </div>
  );
}
```

---

## 6. Automated CLI Commands & Scripts (FFmpeg & Sharp)

### FFmpeg: Compressing Videos

Run these commands in your terminal or scripts to drastically shrink MP4 files:

#### 1. Strip Audio & Faststart (Quickest win for background loops):
```bash
# Reduces file size by 15-30% and allows instant byte-range streaming
ffmpeg -i input.mp4 -an -c:v libx264 -crf 23 -preset slow -movflags +faststart output.mp4
```

#### 2. Convert to Modern WebM (VP9) with High Compression:
```bash
# Yields 30-50% smaller sizes than standard MP4
ffmpeg -i input.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 32 -preset veryslow -pix_fmt yuv420p output.webm
```

#### 3. Extract High-Quality WebP Poster Frame at 1st Second:
```bash
ffmpeg -ss 00:00:01.000 -i input.mp4 -vframes 1 -q:v 80 poster.webp
```

#### 4. Batch Compress All Videos in a Folder (PowerShell):
```powershell
Get-ChildItem -Filter *.mp4 | ForEach-Object {
    $baseName = $_.BaseName
    # 1. Output optimized MP4
    ffmpeg -y -i $_.FullName -an -c:v libx264 -crf 24 -preset slow -movflags +faststart "$($baseName)_optimized.mp4"
    # 2. Output WebM
    ffmpeg -y -i $_.FullName -an -c:v libvpx-vp9 -b:v 0 -crf 33 -pix_fmt yuv420p "$($baseName).webm"
    # 3. Extract poster
    ffmpeg -y -ss 00:00:00.500 -i $_.FullName -vframes 1 -q:v 80 "$($baseName)_poster.webp"
}
```

---

### Sharp / Node.js: Batch Converting Images to WebP & AVIF

Create a lightweight node script `scripts/optimize-images.js`:

```javascript
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ASSETS_DIR = './public/assets';

async function processImages() {
  const files = await fs.readdir(ASSETS_DIR);

  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;

    const inputPath = path.join(ASSETS_DIR, file);
    const baseName = path.parse(file).name;

    console.log(`Processing: ${file}...`);

    // 1. Convert to WebP (Quality 80)
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(ASSETS_DIR, `${baseName}.webp`));

    // 2. Convert to AVIF (Quality 70 - visually lossless)
    await sharp(inputPath)
      .avif({ quality: 70, effort: 6 })
      .toFile(path.join(ASSETS_DIR, `${baseName}.avif`));
  }

  console.log('✓ All images optimized to WebP and AVIF!');
}

processImages();
```

Install sharp and run:
```bash
npm install -D sharp
node scripts/optimize-images.js
```

---

## 7. Priority Action Plan & Audit Matrix

Apply these specific steps to any site with heavy assets:

| Priority | Area | Current Common Bottleneck | Recommended Target State | Expected Gain |
| :---: | :--- | :--- | :--- | :--- |
| **P0** | **Video Preload** | Full blob download (`xhr.responseType = 'blob'`) buffering 16MB in RAM | Native `<video>` with `preload="metadata"` + byte-range streaming | **Instant start**, saves 16MB RAM |
| **P0** | **Video Codecs** | Uncompressed MP4 (15.7MB hero, 2MB cards) | Dual-format (WebM + MP4), stripped audio, `-movflags +faststart` | **60%–75% reduction** (15MB $\to$ 3–4MB) |
| **P0** | **Poster Images** | Black box during video load | Preloaded WebP poster (`fetchpriority="high"`) | **Eliminates LCP lag & visual delay** |
| **P1** | **Images (JPEG/PNG)** | 1.2MB–1.4MB full-size uncompressed JPEGs | Converted to WebP / AVIF (800w/1200w) | **85% reduction** (1.3MB $\to$ 90KB–150KB) |
| **P1** | **Offscreen Media** | All videos and cards running simultaneously | `IntersectionObserver` auto-play on enter, pause on leave | **Saves 80% CPU/GPU and mobile battery** |
| **P2** | **Cache Headers** | Default short-lived or missing cache | `Cache-Control: public, max-age=31536000, immutable` | **Instant loads on repeat visits** |

---

*Authored for production performance engineering across modern React, Next.js, Vite, and static deployment stacks.*
