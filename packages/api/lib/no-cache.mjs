export const noCache = time => (req, res, next) => {
  res.set('cache-control', 'no-cache')
  next()
}
