/** Resolve a demo asset name to a public URL. */
export function demoSrc(name: string): string {
  if (/^(https?:|data:|blob:|\/)/i.test(name)) return name;
  return name.includes(".") ? `/demo/${name}` : `/demo/${name}.png`;
}
