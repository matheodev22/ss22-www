export const SHIPPING_RATES = {
  amba: { label: "AMBA · CABA y GBA", branch: 9300, home: 14800 },
  buenos_aires_interior: { label: "Buenos Aires interior", branch: 9550, home: 15100 },
  centro: { label: "Centro", branch: 9850, home: 15450 },
  norte: { label: "Norte", branch: 9950, home: 15600 },
  patagonia: { label: "Patagonia", branch: 10100, home: 15800 },
};

// CPA argentino: letra provincial + cuatro dígitos + tres letras.
// Los rangos se usan para rechazar códigos manifiestamente inconsistentes;
// no sustituyen la consulta de la dirección exacta en Correo Argentino.
const PROVINCES = {
  A: [4400, 4499, "norte"],       // Salta
  B: [1600, 9999, "buenos_aires_interior"], // Buenos Aires (AMBA se discrimina por CP)
  C: [1000, 1499, "amba"],         // CABA
  D: [5700, 5899, "centro"],       // San Luis
  E: [3100, 3269, "centro"],       // Entre Ríos
  F: [5300, 5399, "norte"],        // La Rioja
  G: [4200, 4399, "norte"],        // Santiago del Estero
  H: [3500, 3739, "norte"],        // Chaco
  J: [5400, 5469, "centro"],       // San Juan
  K: [4700, 4750, "norte"],        // Catamarca
  L: [6300, 6389, "buenos_aires_interior"], // La Pampa
  M: [5500, 5620, "centro"],       // Mendoza
  N: [3300, 3384, "norte"],        // Misiones
  P: [3600, 3630, "norte"],        // Formosa
  Q: [8300, 8407, "patagonia"],    // Neuquén
  R: [8300, 8532, "patagonia"],    // Río Negro
  S: [2000, 3069, "centro"],       // Santa Fe
  T: [9000, 9120, "patagonia"],    // Chubut
  U: [9410, 9420, "patagonia"],    // Tierra del Fuego
  W: [3400, 3485, "norte"],        // Corrientes
  X: [5000, 5949, "centro"],       // Córdoba
  Y: [4600, 4650, "norte"],        // Jujuy
  Z: [9000, 9400, "patagonia"],    // Santa Cruz
};

export function normalizePostalCode(value) {
  return String(value || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
}

export function validatePostalCode(value) {
  const code = normalizePostalCode(value);
  const match = code.match(/^([A-Z])(\d{4})([A-Z]{3})$/);
  if (!match) return { valid: false, zone: null, normalized: code, message: "Ingresá un CPA argentino completo (ej.: B1704ABC), de 8 caracteres." };
  const [, province, digits] = match;
  const rule = PROVINCES[province];
  const number = Number(digits);
  if (!rule || number < rule[0] || number > rule[1] || number === 0) {
    return { valid: false, zone: null, normalized: code, message: "El código postal no coincide con un rango provincial reconocido." };
  }
  const zone = province === "B" && number >= 1600 && number <= 1899 ? "amba" : rule[2];
  return { valid: true, zone, normalized: code, message: "" };
}

export function shippingPrice(zone, method, freeShipping = false) {
  if (freeShipping) return 0;
  const rate = SHIPPING_RATES[zone];
  if (!rate) return null;
  return rate[method === "branch" ? "branch" : "home"];
}
