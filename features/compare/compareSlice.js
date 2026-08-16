import { createSlice } from "@reduxjs/toolkit";

const MAX_COMPARE = 4;

const compareSlice = createSlice({
  name: "compare",
  initialState: { items: [] }, // array of { _id, title, slug, basePrice, images, ... }
  reducers: {
    toggleCompare: (state, action) => {
      const product = action.payload;
      const exists = state.items.some((p) => p._id === product._id);
      if (exists) {
        state.items = state.items.filter((p) => p._id !== product._id);
      } else if (state.items.length < MAX_COMPARE) {
        state.items.push(product);
      }
    },
    clearCompare: (state) => {
      state.items = [];
    },
  },
});

export const { toggleCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
