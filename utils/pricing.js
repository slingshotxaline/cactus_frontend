// Mirrors Product.js getEffectivePrice() on the backend: special > offer > base.
// Use this everywhere a product price is displayed so all three tiers behave
// consistently across cards, product pages, and the admin table.
export const getEffectivePrice = (product) =>
  product?.specialPrice ?? product?.offerPrice ?? product?.basePrice ?? 0;

// The "was" price to show struck through, if any. Falls back to offerPrice's
// parent (basePrice) when specialPrice is active, so a flash sale still shows
// the regular price crossed out even if no explicit oldPrice was set.
export const getStrikethroughPrice = (product) => {
  if (!product) return null;
  const effective = getEffectivePrice(product);
  if (product.oldPrice && product.oldPrice > effective) return product.oldPrice;
  if (product.basePrice && product.basePrice > effective)
    return product.basePrice;
  return null;
};

export const getProductImage = (product) =>
  product?.baseImage?.url || product?.images?.[0]?.url;
