import { createSlice } from "@reduxjs/toolkit";

const initialState = { items: [] }; // { productId, variantId, title, price, image, quantity }

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );
      if (existing) existing.quantity += item.quantity;
      else state.items.push(item);
    },
    removeItem: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      );
    },
    updateQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.variantId === variantId
      );
      if (item) item.quantity = quantity;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
