// src/utils/format.js

// Format a number into PKR currency string
export function formatPKR(amount) {
  if (typeof amount !== "number") {
    amount = Number(amount);
    if (isNaN(amount)) return "Rs 0";
  }
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}
