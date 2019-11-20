// More reactive version of main app.

import { allEvents$ } from './streams.js'
import { queryInput, errorContainer, resultsContainer } from './dom.js'
import { show, hide, empty, createDiv } from './helpers.js'

const { merge } = rxjs
const {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  pairwise,
  share,
  startWith
} = rxjs.operators

const filterType = desiredType => filter(({ type }) => type === desiredType)

const sharedEvents$ = allEvents$.pipe(share())
const entryEvents$ = sharedEvents$.pipe(filterType('entry'))
const resultsEvents$ = sharedEvents$.pipe(filterType('results'))
const errorEvents$ = sharedEvents$.pipe(filterType('error'))

const resultsContentsLoading$ = entryEvents$.pipe(
  mapTo([createDiv('loading', 'Loading...')])
)

const resultsContentsResults$ = resultsEvents$.pipe(
  map(({ payload: results }) =>
    results.map(({ code, city }) =>
      createDiv('result', [createDiv('code', code), createDiv('city', city)])
    )
  )
)

const resultsChildren$ = merge(resultsContentsLoading$, resultsContentsResults$)

const errorText$ = errorEvents$.pipe(map(({ payload: error }) => String(error)))

const nextVisibleElement$ = merge(
  resultsChildren$.pipe(mapTo(resultsContainer)),
  errorText$.pipe(mapTo(errorContainer))
)

const currentAndNextVisibleElement$ = nextVisibleElement$.pipe(
  startWith(resultsContainer),
  distinctUntilChanged(),
  pairwise()
)

currentAndNextVisibleElement$.subscribe(([currentlyVisible, nextVisible]) => {
  hide(currentlyVisible)
  show(nextVisible)
})

resultsChildren$.subscribe(elements => {
  empty(resultsContainer)
  for (const element of elements) {
    resultsContainer.appendChild(element)
  }
})

errorText$.subscribe(text => {
  errorContainer.textContent = text
})

queryInput.focus()
