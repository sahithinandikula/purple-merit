export const fallbackTokens = {
  colors: {
    primary: "#111111",
    secondary: "#eeeeee",
    background: "#ffffff",
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    baseSize: "16px",
  },
};

const normalizeHex = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return match ? `#${match[1].toLowerCase()}` : null;
};

export const sanitizeTokens = (tokens = fallbackTokens) => ({
  colors: {
    primary: normalizeHex(tokens?.colors?.primary) ?? fallbackTokens.colors.primary,
    secondary:
      normalizeHex(tokens?.colors?.secondary) ?? fallbackTokens.colors.secondary,
    background:
      normalizeHex(tokens?.colors?.background) ?? fallbackTokens.colors.background,
  },
  typography: {
    fontFamily:
      typeof tokens?.typography?.fontFamily === "string" &&
      tokens.typography.fontFamily.trim()
        ? tokens.typography.fontFamily.trim()
        : fallbackTokens.typography.fontFamily,
    baseSize:
      typeof tokens?.typography?.baseSize === "string" &&
      /^\d+px$/.test(tokens.typography.baseSize.trim())
        ? tokens.typography.baseSize.trim()
        : fallbackTokens.typography.baseSize,
  },
});

export const mergeLockedTokens = (
  currentTokens = fallbackTokens,
  nextTokens = fallbackTokens,
  locked = {},
) => {
  const safeCurrent = sanitizeTokens(currentTokens);
  const safeNext = sanitizeTokens(nextTokens);

  return {
    colors: {
      primary: locked.primary ? safeCurrent.colors.primary : safeNext.colors.primary,
      secondary: locked.secondary
        ? safeCurrent.colors.secondary
        : safeNext.colors.secondary,
      background: locked.background
        ? safeCurrent.colors.background
        : safeNext.colors.background,
    },
    typography: {
      fontFamily: locked.fontFamily
        ? safeCurrent.typography.fontFamily
        : safeNext.typography.fontFamily,
      baseSize: locked.baseSize
        ? safeCurrent.typography.baseSize
        : safeNext.typography.baseSize,
    },
  };
};
