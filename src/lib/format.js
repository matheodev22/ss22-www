export const money = (value) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(value || 0));
export const depositFor = (total, percent = 30) => Math.round(Number(total) * Number(percent) / 100);
