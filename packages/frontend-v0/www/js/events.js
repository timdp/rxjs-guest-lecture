// Event definitions.

import { lookup } from './api.js'
import { queryInput } from './dom.js'

const dispatch = (type, detail) => {
  document.dispatchEvent(new CustomEvent('demo:' + type, { detail }))
}

const handleQuery = async query => {
  let results
  if (query !== '') {
    results = await lookup(query)
  } else {
    results = []
  }
  dispatch('results', results)
}

const handleError = error => {
  dispatch('error', error)
}

const handleQueryOrError = async query => {
  try {
    await handleQuery(query)
  } catch (err) {
    handleError(err)
  }
}

queryInput.addEventListener('input', () => {
  const query = queryInput.value.trim().toLowerCase()
  dispatch('entry', query)
  handleQueryOrError(query)
})

// So this sort of works, but it has a number of issues:
//
// 1.  If the user enters text while the API request is still going, requests
//     will start to interleave.
//     This can cause invalid results: if request 1 is started before request 2
//     but request 2 completes first, then the user will briefly see the result
//     of request 2, and then, the result of request 1 will show up.
//     We would rather abort the current request when a new one starts. This
//     could be achieved by using an AbortController in api.js and keeping track
//     of the currently running request.
//     However, maintaining that state over time is already way less pleasant.
//
// 2.  Furthermore, since we're dealing with text input, input events will
//     happen in rapid succession. Each of those events will trigger a new
//     request to our server. With one user, this is manageable, but imagine
//     Google doing this.
//     Instead, we want to give the user some time to enter another character
//     before sending their partial input to the server. This is typically
//     achieved by "debouncing" the events: set a timer when an event comes in,
//     and if another event comes in before the timeout elapses, cancel it and
//     start counting again.
//     In other words, more state to maintain over time!
//
// 3.  We have an if that deals with empty input, because we don't want to go
//     to our API unless we have something to search for. However, this actually
//     bring us back to problem 1: if there's still a request running the moment
//     the user clears the input field, that request will complete shortly after
//     and the results of the search will show up. Let's assume that we'll
//     also solve that by canceling the requests though.
//     However, there's an underlying issue here: conditional structures may be
//     a very fundamental concept of programming, but they're just one way to
//     express diverging code paths. Another, more functional way to approach
//     the problem would be to classify the input events by treating them as a
//     list and splitting that list into empty and non-empty input events.
//     Unfortunately, there isn't actually a list here, because the events
//     happen over time. Oh no, there's that state over time again!
//
// There's a pattern here: we need a good way to deal with sequences over time.
// Enter RxJS.
