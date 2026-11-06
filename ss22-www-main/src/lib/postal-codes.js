// Validación estructural del CPA y determinación de zona por provincia.
// La verificación exacta de las 3 letras finales requiere la dirección (calle y altura)
// y la base actualizada de Correo Argentino; no se puede garantizar offline con un regex.
export const PROVINCE_CP_RANGES = {
  A: [4126, 4651], B: [1601, 8512], C: [1003, 1440], D: [5421, 6389],
  E: [1647, 3826], F: [5272, 5713], G: [2340, 5266], H: [3500, 3734],
  J: [5400, 5467], K: [4139, 5345], L: [6200, 8336], M: [5500, 6279],
  N: [3300, 3386], P: [3525, 3636], Q: [8300, 8407], R: [8134, 8536],
  S: [2000, 6106], T: [4000, 4276], U: [8430, 9227], V: [9410, 9420],
  W: [3185, 3486], X: [2189, 6275], Y: [4411, 4655], Z: [9011, 9408],
};

const PROVINCE_ZONE = {
  B: "buenos_aires_interior", C: "amba", K: "norte", H: "norte",
  U: "patagonia", X: "centro", W: "norte", E: "centro",
  P: "norte", Y: "norte", L: "patagonia", F: "norte",
  M: "centro", N: "norte", Q: "patagonia", R: "patagonia",
  A: "norte", J: "centro", D: "centro", Z: "patagonia",
  V: "patagonia", G: "norte", T: "norte", S: "centro",
};

export function normalizeCPA(value = "") {
  return String(value).toUpperCase().replace(/[\s-]/g, "");
}

export function getPostalDestination(value = "") {
  const cpa = normalizeCPA(value);
  if (!/^[A-Z]\d{4}[A-Z]{3}$/.test(cpa)) {
    return { valid: false, error: "Ingresá el CPA completo de 8 caracteres (ej. B1704ABC)." };
  }
  const province = cpa[0];
  const cp = Number(cpa.slice(1, 5));
  const range = PROVINCE_CP_RANGES[province];
  if (!range || cp < range[0] || cp > range[1]) {
    return { valid: false, error: "Ese CPA no coincide con el rango postal conocido para esa provincia." };
  }
  const zone = province === "B" && cp >= 1601 && cp <= 1899
    ? "amba"
    : province === "B" ? "buenos_aires_interior" : PROVINCE_ZONE[province];
  return { valid: true, cpa, province, zone };
}

export function getZoneFromCPA(value = "") {
  const result = getPostalDestination(value);
  return result.valid ? result.zone : null;
}
