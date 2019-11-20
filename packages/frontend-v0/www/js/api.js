// Our API client.

const API_URL_TEMPLATE = 'http://localhost:8123/lookup?query={}'

const buildUrl = query =>
  API_URL_TEMPLATE.replace('{}', encodeURIComponent(query))

export const lookup = async query => {
  const url = buildUrl(query)
  const response = await fetch(url)
  if (!response.ok) {
    const { status, statusText } = response
    throw new Error(`HTTP ${status} ${statusText}`)
  }
  const body = await response.json()
  return body.results
}
