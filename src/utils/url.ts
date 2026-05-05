const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const homeUrl = base || '/';

export function url(path: string): string {
  return `${base}/${path.replace(/^\//, '')}`;
}
