export const slow = time => (req, res, next) => {
  setTimeout(next, time)
}
