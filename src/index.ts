import { csvParse } from 'd3'
import * as fs from 'fs'

const csv = fs.readFileSync('data/flowers.csv', 'utf8')
const parsed = csvParse(csv)

console.log(parsed)
