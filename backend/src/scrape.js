import puppeteer from "puppeteer";
import { PNG } from "pngjs";
import { fallbackTokens, sanitizeTokens } from "./tokens.js";

const NEUTRAL_HEX = new Set(["#000000", "#ffffff"]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parseColor = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    !normalized ||
    normalized === "transparent" ||
    normalized === "inherit" ||
    normalized === "currentcolor"
  ) {
    return null;
  }

  const shortHexMatch = normalized.match(/^#([0-9a-f]{3})$/i);
  if (shortHexMatch) {
    return shortHexMatch[1].split("").map((digit) => parseInt(`${digit}${digit}`, 16));
  }

  const longHexMatch = normalized.match(/^#([0-9a-f]{6})$/i);
  if (longHexMatch) {
    return longHexMatch[1].match(/.{2}/g).map((part) => parseInt(part, 16));
  }

  const rgbaMatch = normalized.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/i,
  );
  if (rgbaMatch) {
    const alpha = rgbaMatch[4] === undefined ? 1 : Number(rgbaMatch[4]);
    if (alpha === 0) {
      return null;
    }

    return rgbaMatch.slice(1, 4).map((channel) => Number(channel));
  }

  const hslMatch = normalized.match(
    /hsla?\(([-\d.]+),\s*([-\d.]+)%?,\s*([-\d.]+)%?/i,
  );
  if (!hslMatch) {
    return null;
  }

  const hue = ((Number(hslMatch[1]) % 360) + 360) % 360;
  const saturation = clamp(Number(hslMatch[2]) / 100, 0, 1);
  const lightness = clamp(Number(hslMatch[3]) / 100, 0, 1);

  if (saturation === 0) {
    const gray = Math.round(lightness * 255);
    return [gray, gray, gray];
  }

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let rgb = [0, 0, 0];

  if (huePrime >= 0 && huePrime < 1) rgb = [chroma, x, 0];
  else if (huePrime < 2) rgb = [x, chroma, 0];
  else if (huePrime < 3) rgb = [0, chroma, x];
  else if (huePrime < 4) rgb = [0, x, chroma];
  else if (huePrime < 5) rgb = [x, 0, chroma];
  else rgb = [chroma, 0, x];

  const match = lightness - chroma / 2;
  return rgb.map((channel) => Math.round((channel + match) * 255));
};

const toHex = (rgb) =>
  `#${rgb
    .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const saturation = ([r, g, b]) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return 0;
  }

  const delta = max - min;
  return delta / (1 - Math.abs(2 * lightness - 1));
};

const isNeutralColor = (rgb) => {
  const hex = toHex(rgb);
  if (NEUTRAL_HEX.has(hex)) {
    return true;
  }

  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 12 || saturation(rgb) < 0.08;
};

const colorDistance = (first, second) =>
  Math.sqrt(
    first.reduce((total, channel, index) => {
      const delta = channel - second[index];
      return total + delta * delta;
    }, 0),
  );

const rgbFromHex = (hex) => parseColor(hex);

const collectPaletteSwatches = (palette) =>
  Object.values(palette ?? {})
    .filter(Boolean)
    .map((swatch) => swatch.rgb.map((channel) => Math.round(channel)));

const addCandidate = (scoreMap, value, source, baseScore) => {
  const rgb = Array.isArray(value) ? value : parseColor(value);
  if (!rgb) {
    return;
  }

  const hex = toHex(rgb);
  const entry = scoreMap.get(hex) ?? {
    hex,
    rgb,
    score: 0,
    frequency: 0,
    sources: new Set(),
  };

  entry.frequency += 1;
  entry.score += baseScore;
  entry.sources.add(source);
  scoreMap.set(hex, entry);
};

const finalizeCandidates = (scoreMap) =>
  [...scoreMap.values()]
    .map((entry) => {
      const score =
        entry.score +
        Math.min(entry.frequency, 3) * 2 +
        (isNeutralColor(entry.rgb) ? -10 : 0);

      return {
        ...entry,
        score,
      };
    })
    .sort((first, second) => second.score - first.score);

const chooseBackground = (backgrounds) => {
  const parsedBackgrounds = backgrounds
    .map((value) => parseColor(value))
    .filter(Boolean)
    .sort((first, second) => luminance(second) - luminance(first));

  return parsedBackgrounds[0] ?? [245, 245, 245];
};

const choosePrimary = (candidates, backgroundRgb) => {
  const fallback = candidates.find(
    (candidate) =>
      !isNeutralColor(candidate.rgb) && colorDistance(candidate.rgb, backgroundRgb) > 40,
  );

  return fallback ?? null;
};

const chooseSecondary = (candidates, primaryRgb, backgroundRgb) => {
  return (
    candidates.find((candidate) => {
      if (candidate.hex === toHex(primaryRgb)) {
        return false;
      }

      return (
        colorDistance(candidate.rgb, primaryRgb) > 45 &&
        colorDistance(candidate.rgb, backgroundRgb) > 30
      );
    }) ?? null
  );
};

const chooseRefinedPrimary = (candidates, currentPrimaryHex, backgroundRgb) => {
  if (!currentPrimaryHex) {
    return choosePrimary(candidates, backgroundRgb);
  }

  const baseline = candidates.find((candidate) => candidate.hex === currentPrimaryHex);
  if (!baseline) {
    return choosePrimary(candidates, backgroundRgb);
  }

  const alternative = candidates.find((candidate) => {
    if (candidate.hex === currentPrimaryHex || isNeutralColor(candidate.rgb)) {
      return false;
    }

    const strongSource =
      candidate.sources.has("image") ||
      candidate.sources.has("css-variable") ||
      candidate.sources.has("visible-section");

    const closeEnoughScore = candidate.score >= baseline.score - 3;
    const moreSaturated = saturation(candidate.rgb) > saturation(baseline.rgb) + 0.08;
    const farFromBackground = colorDistance(candidate.rgb, backgroundRgb) > 40;

    return strongSource && closeEnoughScore && moreSaturated && farFromBackground;
  });

  return alternative ?? baseline ?? choosePrimary(candidates, backgroundRgb);
};

const normalizeBucketChannel = (value) => clamp(Math.round(value / 32) * 32, 0, 255);

const extractImageAccent = async (page, largestImage) => {
  if (!largestImage) {
    return [];
  }

  const clip = {
    x: Math.max(0, largestImage.x),
    y: Math.max(0, largestImage.y),
    width: Math.max(1, largestImage.width),
    height: Math.max(1, largestImage.height),
  };

  const imageBuffer = await page.screenshot({
    clip,
    type: "png",
  });

  const png = PNG.sync.read(Buffer.from(imageBuffer));
  const buckets = new Map();

  for (let index = 0; index < png.data.length; index += 16) {
    const alpha = png.data[index + 3];
    if (alpha < 128) {
      continue;
    }

    const rgb = [png.data[index], png.data[index + 1], png.data[index + 2]];
    if (isNeutralColor(rgb)) {
      continue;
    }

    const bucket = [
      normalizeBucketChannel(rgb[0]),
      normalizeBucketChannel(rgb[1]),
      normalizeBucketChannel(rgb[2]),
    ];
    const key = toHex(bucket);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 4)
    .map(([hex]) => rgbFromHex(hex))
    .filter(Boolean);
};

export const extractTokensFromUrl = async (url, options = {}) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const extracted = await page.evaluate(() => {
      const readColors = (styles) => [styles.color, styles.backgroundColor, styles.borderColor];

      const bodyStyles = window.getComputedStyle(document.body);
      const rootStyles = window.getComputedStyle(document.documentElement);
      const allVariables = [];

      for (let index = 0; index < rootStyles.length; index += 1) {
        const name = rootStyles[index];
        if (
          /primary|brand|accent|color-primary|theme/i.test(name) &&
          rootStyles.getPropertyValue(name)?.trim()
        ) {
          allVariables.push(rootStyles.getPropertyValue(name).trim());
        }
      }

      const sampleSelectors = [
        "button",
        "a",
        "h1",
        "h2",
        "h3",
        "p",
        ".btn",
        "[role='button']",
        "input",
        "nav",
      ];

      const sectionSelectors = [
        "header",
        "main",
        "section",
        "[class*='hero']",
        "[id*='hero']",
        "[class*='banner']",
        "[class*='masthead']",
      ];

      const frequentColors = [];
      sampleSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.width < 8 || rect.height < 8) {
            return;
          }

          const styles = window.getComputedStyle(node);
          frequentColors.push(...readColors(styles));
        });
      });

      const visibleSectionColors = [];
      const sectionBackgrounds = [];

      sectionSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => {
          const rect = node.getBoundingClientRect();
          const isVisible =
            rect.width > 80 &&
            rect.height > 60 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight * 1.2;

          if (!isVisible) {
            return;
          }

          const styles = window.getComputedStyle(node);
          visibleSectionColors.push(...readColors(styles));
          sectionBackgrounds.push(styles.backgroundColor);
        });
      });

      const images = [...document.images]
        .map((image) => {
          const rect = image.getBoundingClientRect();
          const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
          const visibleHeight =
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

          return {
            x: Math.max(rect.left, 0),
            y: Math.max(rect.top, 0),
            width: Math.max(0, visibleWidth),
            height: Math.max(0, visibleHeight),
            area: Math.max(0, visibleWidth) * Math.max(0, visibleHeight),
          };
        })
        .filter((image) => image.width > 80 && image.height > 80)
        .sort((first, second) => second.area - first.area);

      return {
        cssVariables: allVariables,
        bodyColor: bodyStyles.color,
        bodyBackground: bodyStyles.backgroundColor,
        fontFamily: bodyStyles.fontFamily,
        baseSize: bodyStyles.fontSize,
        frequentColors,
        visibleSectionColors,
        sectionBackgrounds,
        largestImage: images[0] ?? null,
      };
    });

    const scoreMap = new Map();

    extracted.cssVariables.forEach((color) => addCandidate(scoreMap, color, "css-variable", 7));
    extracted.visibleSectionColors.forEach((color) =>
      addCandidate(scoreMap, color, "visible-section", 5),
    );
    extracted.frequentColors.forEach((color) =>
      addCandidate(scoreMap, color, "computed-style", 1),
    );

    const imagePalette = await extractImageAccent(page, extracted.largestImage);
    imagePalette.forEach((rgb) => addCandidate(scoreMap, rgb, "image", 4));

    const backgroundRgb = chooseBackground([
      extracted.bodyBackground,
      ...extracted.sectionBackgrounds,
    ]);

    const candidates = finalizeCandidates(scoreMap).filter(
      (candidate) => candidate.hex !== toHex(backgroundRgb),
    );

    const currentPrimaryHex = sanitizeTokens(options.currentTokens ?? fallbackTokens).colors.primary;
    const primaryCandidate = options.refine
      ? chooseRefinedPrimary(candidates, currentPrimaryHex, backgroundRgb)
      : choosePrimary(candidates, backgroundRgb);
    const secondaryCandidate = chooseSecondary(
      candidates,
      primaryCandidate?.rgb ?? [17, 17, 17],
      backgroundRgb,
    );

    const refinedColors = sanitizeTokens({
      colors: {
        primary: primaryCandidate?.hex ?? fallbackTokens.colors.primary,
        secondary:
          secondaryCandidate?.hex ??
          (luminance(backgroundRgb) > 0.65
            ? fallbackTokens.colors.secondary
            : fallbackTokens.colors.background),
        background: toHex(backgroundRgb),
      },
      typography: {
        fontFamily: extracted.fontFamily || fallbackTokens.typography.fontFamily,
        baseSize: extracted.baseSize || fallbackTokens.typography.baseSize,
      },
    });

    if (
      refinedColors.colors.primary === refinedColors.colors.background ||
      NEUTRAL_HEX.has(refinedColors.colors.primary)
    ) {
      const fallbackPrimary = candidates.find(
        (candidate) =>
          !NEUTRAL_HEX.has(candidate.hex) &&
          candidate.hex !== refinedColors.colors.background,
      );

      if (fallbackPrimary) {
        refinedColors.colors.primary = fallbackPrimary.hex;
      }
    }

    return refinedColors;
  } catch (error) {
    return fallbackTokens;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
