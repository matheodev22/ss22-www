export const SHIPPING_RATES = {
  amba: { label: "AMBA · CABA y GBA", branch: 9300, home: 14800 },
  buenos_aires_interior: { label: "Buenos Aires interior", branch: 9550, home: 15100 },
  centro: { label: "Centro · Córdoba, Santa Fe, Entre Ríos y San Luis", branch: 9850, home: 15450 },
  norte: { label: "Norte · NOA y NEA", branch: 9950, home: 15600 },
  patagonia: { label: "Patagonia · Neuquén al sur", branch: 10100, home: 15800 },
};

export function shippingPrice(zone, method, freeShipping = false) {
  if (freeShipping) return 0;
  const rate = SHIPPING_RATES[zone];
  if (!rate) return null;
  return rate[method === "branch" ? "branch" : "home"];
}
