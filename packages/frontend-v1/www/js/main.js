// Main app.

import { allEvents$ } from './streams.js'
import { queryInput, errorContainer, resultsContainer } from './dom.js'
import { show, hide, empty, createDiv } from './helpers.js'

// Handles a keystroke in the query field.
const handleEntry = () => {
  hide(errorContainer)
  empty(resultsContainer)
  resultsContainer.textContent = 'Loading...'
  show(resultsContainer)
}

// Handles an update of the results for the current query.
const handleResults = results => {
  hide(errorContainer)
  empty(resultsContainer)
  show(resultsContainer)
  for (const { code, city } of results) {
    resultsContainer.appendChild(
      createDiv('result', [createDiv('code', code), createDiv('city', city)])
    )
  }
}

// Handles all errors.
const handleError = error => {
  hide(resultsContainer)
  errorContainer.textContent = String(error)
  show(errorContainer)
}

// Maps an event type to its handler.
const handlers = {
  entry: handleEntry,
  results: handleResults,
  error: handleError
}

// Generic event handler. Called for all events that trigger a UI update.
// This is the Command pattern.
const handleEvent = ({ type, payload }) => {
  const handler = handlers[type]
  if (handler == null) {
    throw new Error(`Unexpected event: ${type}`)
  }
  handler(payload)
}

// Subscribe to our top-level stream to activate it. Additionally, if this
// stream enters the error state, we also report that. The latter is mainly in
// place for debugging purposes.
allEvents$.subscribe(handleEvent, handleError)

// Focus our input field so the user can start typing.
queryInput.focus()
