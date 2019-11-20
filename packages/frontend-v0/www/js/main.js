// Main app.

import './events.js'
import { queryInput, errorContainer, resultsContainer } from './dom.js'
import { show, hide, empty, createDiv } from './helpers.js'

// Handle keystrokes in the query field.
document.addEventListener('demo:entry', () => {
  hide(errorContainer)
  empty(resultsContainer)
  resultsContainer.textContent = 'Loading...'
  show(resultsContainer)
})

// Handle updates of the results for the current query.
document.addEventListener('demo:results', event => {
  const results = event.detail
  hide(errorContainer)
  empty(resultsContainer)
  show(resultsContainer)
  for (const { code, city } of results) {
    resultsContainer.appendChild(
      createDiv('result', [createDiv('code', code), createDiv('city', city)])
    )
  }
})

// Handle errors.
document.addEventListener('demo:error', event => {
  const error = event.detail
  hide(resultsContainer)
  errorContainer.textContent = String(error)
  show(errorContainer)
})

// Focus our input field so the user can start typing.
queryInput.focus()
