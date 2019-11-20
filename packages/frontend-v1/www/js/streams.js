// Stream definitions.

import { lookup } from './api.js'
import { queryInput } from './dom.js'

const { fromEvent, merge, of } = rxjs
const {
  catchError,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  mergeMap,
  startWith,
  switchAll
} = rxjs.operators

// Stream of key presses from our input field.
const queryKeyPresses$ = fromEvent(queryInput, 'input')

// Stream of queries entered into our input field. Normalized by removing
// whitespace. Events are only published if the query actually changes.
const queries$ = queryKeyPresses$.pipe(
  startWith(null),
  map(() => queryInput.value.trim().toLowerCase()),
  distinctUntilChanged()
)

// Stream of 'entry' events. Used to notify the UI of user input. We'll also
// use this standard event format in other places below, so that all events
// consumed by the UI follow the same interface.
const queryEntries$ = queries$.pipe(
  map(query => ({ type: 'entry', payload: query }))
)

// Stream of queries that are not empty (zero-length). These are the ones for
// which we want to go to our API and get results.
const nonEmptyQueries$ = queries$.pipe(filter(query => query.length !== 0))

// Stream of queries that are the empty string. In this case, we do not want to
// go to our API, but instead, clear the list of results.
const emptyQueries$ = queries$.pipe(filter(query => query.length === 0))

// Stream of results for the non-empty queries.
// This is a higher-order observable: every event in the stream is a new stream.
// Those streams inside the stream each correspond to a request going to our
// API, which is in itself an asynchronous process--hence the stream. Thus, we
// have a stream of requests triggered by the user entering input.
// We also introduce a delay of 250 ms on every query. This is a way to debounce
// user input, so that not every keystroke results in an HTTP request. Below,
// we'll ensure that consecutive requests do not overlap.
// If the request fails on any of the inner streams (try entering "oops"), we
// don't want the outer stream to error out. Otherwise, once an error has
// occurred, the outer stream would no longer produce any events, and the app
// would stop.
// Therefore, we catch the inner errors and turn them into regular events on the
// outer stream. This means that we now have two types of event: success and
// failure. To model this, we use the same { type, payload } structure.
// TODO Explore ways to use the debounceTime operator here
const nonEmptyQueryResults$ = nonEmptyQueries$.pipe(
  map(query =>
    of(query).pipe(
      delay(250),
      mergeMap(lookup),
      map(results => ({ type: 'results', payload: results })),
      catchError(error => of({ type: 'error', payload: error }))
    )
  )
)

// Stream of results produced by entering an empty query. Used to clear the
// list of results.
// Like the results for non-empty queries, this is also a higher-order
// observable. In this case, the streams inside the stream complete immediately,
// and they may therefore seem overly complex. However, this approach gives us
// a single interface shared between the results for non-empty and empty
// queries, which we will use below.
const emptyQueryResults$ = emptyQueries$.pipe(
  mapTo(of({ type: 'results', payload: [] }))
)

// Stream of all query results, both non-empty and empty.
// We start by merging our two higher-order observables, so that we have a
// single stream of query results, each represented as an observable. Because
// we are only interested in the latest result, we want to cancel a pending
// request to our API as soon as a new event comes in on either stream
// (non-empty or empty). We achieve this by using the switch operator.
// Having applied switch, we have a stream of the results for the latest
// query entered by the user.
const queryResults$ = merge(nonEmptyQueryResults$, emptyQueryResults$).pipe(
  switchAll()
)

// So far, we have produced a stream modeling user input events and a stream
// modeling results. They both follow the { type, payload } interface.
// We now merge those two streams into a single stream of all events for our
// entire app.
export const allEvents$ = merge(queryEntries$, queryResults$)
