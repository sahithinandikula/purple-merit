import { create } from "zustand";
import { defaultLocked, defaultTokens } from "./constants";

const mergeLockedTokens = (currentTokens, nextTokens, locked) => ({
  colors: {
    primary: locked.primary ? currentTokens.colors.primary : nextTokens.colors.primary,
    secondary: locked.secondary
      ? currentTokens.colors.secondary
      : nextTokens.colors.secondary,
    background: locked.background
      ? currentTokens.colors.background
      : nextTokens.colors.background,
  },
  typography: {
    fontFamily: locked.fontFamily
      ? currentTokens.typography.fontFamily
      : nextTokens.typography.fontFamily,
    baseSize: locked.baseSize
      ? currentTokens.typography.baseSize
      : nextTokens.typography.baseSize,
  },
});

export const useStyleSyncStore = create((set) => ({
  url: "",
  status: "idle",
  error: "",
  analyzedUrl: "",
  savedTokenId: "",
  tokens: defaultTokens,
  locked: defaultLocked,
  setUrl: (url) => set({ url }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  applyFetchedTokens: (nextTokens) =>
    set((state) => ({
      tokens: mergeLockedTokens(state.tokens, nextTokens, state.locked),
      error: "",
      status: "success",
      analyzedUrl: state.url,
    })),
  updateColor: (name, value) =>
    set((state) => ({
      tokens: {
        ...state.tokens,
        colors: {
          ...state.tokens.colors,
          [name]: value,
        },
      },
    })),
  updateTypography: (name, value) =>
    set((state) => ({
      tokens: {
        ...state.tokens,
        typography: {
          ...state.tokens.typography,
          [name]: value,
        },
      },
    })),
  toggleLock: (name) =>
    set((state) => ({
      locked: {
        ...state.locked,
        [name]: !state.locked[name],
      },
    })),
  setSavedTokenId: (savedTokenId) => set({ savedTokenId }),
  resetError: () => set({ error: "" }),
}));
