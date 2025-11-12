export function buildUrl(path: string) {
  const origin = window.location.origin;
  return `${origin}${path}`;
}
