import { createSlice } from "@reduxjs/toolkit";

const MAX_RECENT = 12;
const STORAGE_KEY = "recently_viewed_products";

// Persisted to localStorage so it survives page reloads/browser restarts —
// this is a real Next.js app (not a sandboxed preview), so localStorage is
// the right tool here. loadInitialState guards for SSR where window is undefined.
const loadInitialState = () => {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return { items: raw ? JSON.parse(raw) : [] };
  } catch {
    return { items: [] };
  }
};

const persist = (items) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or disabled — recently-viewed just won't persist, non-critical
  }
};

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState: loadInitialState(),
  reducers: {
    recordView: (state, action) => {
      const product = action.payload;
      state.items = [product, ...state.items.filter((p) => p._id !== product._id)].slice(0, MAX_RECENT);
      persist(state.items);
    },
  },
});

export const { recordView } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
