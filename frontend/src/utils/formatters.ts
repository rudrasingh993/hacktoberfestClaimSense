export function formatRupees(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return '₹0';
  const rupees = Math.round(paise / 100);
  
  // Format with Indian numbering system (e.g. 1,44,000)
  const isNegative = rupees < 0;
  const absRupees = Math.abs(rupees).toString();
  
  let lastThree = absRupees.substring(absRupees.length - 3);
  const otherNumbers = absRupees.substring(0, absRupees.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatRatio(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined) return '1.0';
  return Number(ratio).toFixed(3);
}

export function formatPercent(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '0%';
  return `${pct}%`;
}

export function paiseToRupees(paise: number): number {
  return Math.round(paise / 100);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
