export function toHex(v: number | undefined): string {
  return ("00" + v?.toString(16).toUpperCase()).substr(-2);
}
