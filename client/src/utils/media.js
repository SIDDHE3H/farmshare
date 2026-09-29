const apiOrigin = import.meta.env.VITE_API_ORIGIN || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export function getMediaUrl(url) {
  return url && url.startsWith('/uploads') ? `${apiOrigin}${url}` : url;
}