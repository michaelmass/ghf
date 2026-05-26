export const normalizeUrl = (urlString: string) => {
  const url = new URL(urlString)
  url.pathname = new URL(url.pathname, 'http://dummy').pathname
  return url.toString()
}

export const fetchText = async (url: string, label = 'content') => {
  let response: Response

  try {
    response = await fetch(url)
  } catch (cause) {
    throw new Error(`Failed to fetch ${label} from ${url}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause })
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${label} from ${url}: ${response.status} ${response.statusText}`)
  }

  return response.text()
}
