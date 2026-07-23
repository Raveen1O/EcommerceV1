export const getProductImage = (product) => {
  if (!product) return null;
  if (product.image || product.imageUrl) {
    return product.image || product.imageUrl;
  }
  const name = (product.name || '').toLowerCase();
  
  if (name.includes('iphone')) {
    return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60'; // iPhone
  }
  if (name.includes('nokia') || name.includes('phone') || name.includes('mobile')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60'; // smartphone/nokia
  }
  if (name.includes('laptop') || name.includes('lapptop') || name.includes('computer')) {
    return 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=500&auto=format&fit=crop&q=60'; // laptop
  }
  if (name.includes('chair')) {
    return 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&auto=format&fit=crop&q=60'; // chair
  }
  if (name.includes('table')) {
    return 'https://images.unsplash.com/photo-1530018607912-eff2df114f11?w=500&auto=format&fit=crop&q=60'; // table
  }
  if (name.includes('lollipop') || name.includes('sweet') || name.includes('candy')) {
    return 'https://images.unsplash.com/photo-1534080391025-497c0c275191?w=500&auto=format&fit=crop&q=60'; // lollipop/sweets
  }
  if (name.includes('dome') || name.includes('armour') || name.includes('shield')) {
    return 'https://images.unsplash.com/photo-1585152002465-43c1f6cd8247?w=500&auto=format&fit=crop&q=60'; // armour/metallic shield
  }
  if (name.includes('bat') || name.includes('baseball')) {
    return 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=500&auto=format&fit=crop&q=60'; // sports bat
  }
  if (name.includes('cannon') || name.includes('weapon')) {
    return 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=500&auto=format&fit=crop&q=60'; // cannon
  }
  if (name.includes('warstaff') || name.includes('staff')) {
    return 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500&auto=format&fit=crop&q=60'; // fantasy staff
  }
  // Fallback to a neutral product image so cards always show visuals
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60&sat=-20';
};
