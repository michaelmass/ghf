export const normalizeUrl = (urlString: string) => {
  const url = new URL(urlString)
  url.pathname = new URL(url.pathname, 'http://dummy').pathname
  return url.toString()
}
