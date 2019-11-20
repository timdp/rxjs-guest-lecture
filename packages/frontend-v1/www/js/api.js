// Our API client.

const { throwError } = rxjs
const { ajax, AjaxError } = rxjs.ajax
const { catchError, map } = rxjs.operators

const API_URL_TEMPLATE = 'http://localhost:8123/lookup?query={}'

const buildUrl = query =>
  API_URL_TEMPLATE.replace('{}', encodeURIComponent(query))

const mapResponseToResults = map(({ response }) => response.results)

const cleanError = error => {
  if (error instanceof AjaxError) {
    const { status, statusText } = error.xhr
    return new Error(`HTTP ${status} ${statusText}`)
  }
  return error
}

export const lookup = query => {
  const url = buildUrl(query)
  const response$ = ajax(url)
  return response$.pipe(
    mapResponseToResults,
    catchError(error => throwError(cleanError(error)))
  )
}
