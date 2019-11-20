import byline from 'byline'
import stringSimilarity from 'string-similarity'
import { join } from 'path'
import { createReadStream } from 'fs'
import { MAX_RESULTS } from './config.mjs'
import { pkg } from './paths.mjs'

const data = []

const calculateSimilarity = (s1, s2) =>
  stringSimilarity.compareTwoStrings(s1, s2)

const populateData = async () => {
  const dataPath = join(pkg, 'data/codes.txt')
  const stringStream = createReadStream(dataPath, 'utf8')
  const lineStream = byline(stringStream)
  for await (const line of lineStream) {
    const pos = line.indexOf(' ')
    if (pos < 0) {
      return
    }
    const code = parseInt(line.substr(0, pos), 10)
    const city = line.substr(pos + 1)
    data.push({ code, city })
  }
  console.log(`Data loaded: ${data.length} entries`)
}

populateData()

export const lookup = query =>
  data
    .map(props => ({
      ...props,
      similarity: calculateSimilarity(query, props.city)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, MAX_RESULTS)
