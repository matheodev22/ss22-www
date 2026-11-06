// Tarifas comerciales estimadas de SS22 y validación de CP argentino de 4 dígitos.
// Los rangos permiten descartar números fuera de los rangos postales conocidos.
// Para validar una dirección/sucursal exacta se necesita consultar Correo Argentino.
export const SHIPPING_RATES = {
  amba: { label: "AMBA", branch: 9300, home: 14800 },
  buenos_aires_interior: { label: "Buenos Aires interior", branch: 9550, home: 15100 },
  centro: { label: "Centro", branch: 9850, home: 15450 },
  norte: { label: "Norte", branch: 9950, home: 15600 },
  patagonia: { label: "Patagonia", branch: 10100, home: 15800 },
};

// Completar con sucursales confirmadas de Correo Argentino por zona.
// Mientras estén vacías, la tienda informa que SS22 confirmará la sucursal disponible.
export const BRANCH_PICKUP_POINTS = {
  amba: [],
  buenos_aires_interior: [],
  centro: [],
  norte: [],
  patagonia: [],
};

const POSTAL_RANGES = [
  { min: 1000, max: 1899, zone: "amba" },
  { min: 1900, max: 1999, zone: "buenos_aires_interior" },
  { min: 2000, max: 3299, zone: "centro" },
  { min: 3300, max: 4999, zone: "norte" },
  { min: 5000, max: 5999, zone: "centro" },
  { min: 6000, max: 8299, zone: "buenos_aires_interior" },
  { min: 8300, max: 9999, zone: "patagonia" },
];

export function normalizePostalCode(value = "") {
  return String(value || "").trim();
}

export function validatePostalCode(value = "") {
  const code = normalizePostalCode(value);
  if (!/^\d{4}$/.test(code)) {
    return { valid: false, zone: null, normalized: code, message: "Ingresá un código postal argentino de 4 números (ej.: 1704)." };
  }
  const number = Number(code);
  const match = POSTAL_RANGES.find((range) => number >= range.min && number <= range.max);
  if (!match || number === 0) {
    return { valid: false, zone: null, normalized: code, message: "Ese código está fuera de los rangos postales contemplados. Revisalo antes de continuar." };
  }
  return { valid: true, zone: match.zone, normalized: code, message: "" };
}

export function shippingPrice(zone, method, freeShipping = false) {
  if (freeShipping) return 0;
  const rate = SHIPPING_RATES[zone];
  if (!rate) return null;
  return rate[method === "branch" ? "branch" : "home"];
}

export function getBranchPickupInfo(zone) {
  const points = BRANCH_PICKUP_POINTS[zone] || [];
  return points.length
    ? points.join(" · ")
    : "La sucursal habilitada se confirma por WhatsApp según la disponibilidad de tu zona antes del despacho.";
}
