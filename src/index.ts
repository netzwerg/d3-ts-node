import { csvFormat, csvParse, DSVRowArray, DSVRowString, format, timeFormat, timeParse } from 'd3'
import * as fs from 'fs'
import * as assert from 'assert'

/* ·················································································································· */
/*  Parsing (Input)
/* ·················································································································· */

type ParsedPerson = Readonly<{
    Index: number
    'First Name': string
    'Last Name': string
    'Date Of Birth': Date
    Height: number
    Weight: number
    'Small Shirt Size': boolean
    'Medium Shirt Size': boolean
    'Large Shirt Size': boolean
    'Hair Color': HairColor
}>

type HairColor = 'Black' | 'Grey' | 'Red' | 'Brown' | 'Blonde'

const parseFirstName = (n: string | undefined): string => {
    return Array.from(n || '')
        .map((c: string, index: number) => {
            return index === 0 ? c.toUpperCase() : c.toLowerCase()
        })
        .join('')
}

const parseDate = (s: string | undefined): Date => {
    const dateString = s || ''
    const today = new Date()
    const specifier = dateString.trim().length === 8 ? '%d.%m.%y' : '%d.%m.%Y'
    const date = timeParse(specifier)(dateString) || today
    if (date.getFullYear() >= 2000) {
        date.setFullYear(date.getFullYear() - 100)
    }
    return date
}

const parseBoolean = (s: string | undefined): boolean => {
    return s ? 'x' === s.trim().toLowerCase() : false
}

const parseHairColor = (hairColor: string | undefined): HairColor => {
    switch (hairColor) {
        case 'Gray':
            return 'Grey'
        case 'Black':
        case 'Grey':
        case 'Red':
        case 'Brown':
        case 'Blonde':
            return hairColor
        default:
            return 'Brown'
    }
}

/* ·················································································································· */
/*  Formatting (Output)
/* ·················································································································· */

type FormattedPerson = Readonly<{
    Index: string
    'First Name': string
    'Last Name': string
    'Date Of Birth': string
    Height: string
    Weight: string
    'Shirt Size': string
    'Hair Color': string
}>

const formatIndex = (index: number) => format('0>4')(index)

const formatDate = (date: Date): string => timeFormat('%d.%m.%Y')(date)

const formatHeight = (h: number) => Math.round(h).toString()

const formatWeight = (w: number) => Math.round(w).toString()

type ShirtSize = 'S' | 'M' | 'L'

const formatShirtSize = (isS: boolean, isM: boolean, isL: boolean): ShirtSize => {
    const defaultShirtSize = 'M'
    return isS ? 'S' : isM ? 'M' : isL ? 'L' : defaultShirtSize
}

/* ·················································································································· */
/*  Wrangling
/* ·················································································································· */

const csv = fs.readFileSync('data/persons-raw.csv', 'utf8')
const parsed: DSVRowArray<string> = csvParse(csv)

const col = (index: number) => parsed.columns[index]
const valueAt = (row: DSVRowString) => (columnIndex: number) => row[col(columnIndex)]

const parsedPersons: ParsedPerson[] = parsed
    .filter(row => valueAt(row)(0) !== '')
    .map<ParsedPerson>((row: DSVRowString, index: number) => {
        const c = valueAt(row)
        return {
            Index: index + 1,
            'First Name': parseFirstName(c(1)),
            'Last Name': c(2) || '',
            'Date Of Birth': parseDate(c(3)),
            Height: Number(c(4)),
            Weight: Number(c(5)),
            'Small Shirt Size': parseBoolean(c(6)),
            'Medium Shirt Size': parseBoolean(c(7)),
            'Large Shirt Size': parseBoolean(c(8)),
            'Hair Color': parseHairColor(c(9))
        }
    })

const formattedPersons: FormattedPerson[] = parsedPersons.map(person => {
    return {
        Index: formatIndex(person.Index),
        'First Name': person['First Name'],
        'Last Name': person['Last Name'],
        'Date Of Birth': formatDate(person['Date Of Birth']),
        Height: formatHeight(person.Height),
        Weight: formatWeight(person.Weight),
        'Shirt Size': formatShirtSize(
            person['Small Shirt Size'],
            person['Medium Shirt Size'],
            person['Large Shirt Size']
        ),
        'Hair Color': person['Hair Color']
    }
})

/* ·················································································································· */
/*  Output
/* ·················································································································· */

const actual: string = csvFormat(formattedPersons)

assert(actual === fs.readFileSync('data/persons-expected.csv', 'utf8'))

fs.writeFileSync('data/persons-actual.csv', actual)

console.log('-- DONE (waiting for changes) ---')
