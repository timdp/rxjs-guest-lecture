import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const self = fileURLToPath(import.meta.url)

export const pkg = resolve(dirname(self), '..')

export const root = resolve(pkg, '../..')
