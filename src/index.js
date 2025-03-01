const UNITS = {
  YEAR: 31536000,
  MONTH: 2628000,
  DAY: 86400,
  HOUR: 3600,
  MINUTE: 60,
  SECOND: 1
}

const YEAR_UNIT = 'years'
const MONTH_UNIT = 'months'
const DAY_UNIT = 'days'
const HOUR_UNIT = 'hours'
const MINUTE_UNIT = 'minutes'
const SECOND_UNIT = 'seconds'
const IS_NEGATIVE_UNIT = 'isNegative'

const emptyPeriod = {
  [YEAR_UNIT]: 0,
  [MONTH_UNIT]: 0,
  [DAY_UNIT]: 0
}

const emptyTime = {
  [HOUR_UNIT]: 0,
  [MINUTE_UNIT]: 0,
  [SECOND_UNIT]: 0
}

const isValidXsdDuration = str =>
  /^(-?)P(?=.)((\d+)Y)?((\d+)M)?((\d+)D)?(T(?=.)((\d+)H)?((\d+)M)?(\d*(\.\d+)?S)?)?$/.test(
    str
  )
const isNonEmptyString = input => typeof input === 'string' && input.length > 0
const isNegative = str => str[0] === '-'
const stripFirstChar = str => str.slice(1)
const unitToSeconds = (unit, amount) => UNITS[unit.toUpperCase()] * amount

const parseUnit = (unit, amount) => {
  const amt = getNumber(amount)
  return unitToSeconds(unit, amt)
}

const getNumber = amount => {
  const amt = parseFloat(amount)
  if (isNaN(amt)) return 0
  return amt
}

const parsePeriod = period => {
  const [, year, month, day] =
    /^(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/g.exec(period) || []

  return (
    parseUnit('year', year) + parseUnit('month', month) + parseUnit('day', day)
  )
}

const parsePeriodToObject = period => {
  const [, years, months, days] =
    /^(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/g.exec(period) || []

  return {
    [YEAR_UNIT]: getNumber(years),
    [MONTH_UNIT]: getNumber(months),
    [DAY_UNIT]: getNumber(days)
  }
}

const parseTime = time => {
  const [, hour, minute, second] =
    /^(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/g.exec(time) || []

  return (
    parseUnit('hour', hour) +
    parseUnit('minute', minute) +
    parseUnit('second', second)
  )
}

const parseTimeToObject = time => {
  const [, hours, minutes, seconds] =
    /^(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/g.exec(time) || []

  return {
    [HOUR_UNIT]: getNumber(hours),
    [MINUTE_UNIT]: getNumber(minutes),
    [SECOND_UNIT]: getNumber(seconds)
  }
}

const parse = str => {
  const neg = isNegative(str)
  const duration = neg ? stripFirstChar(str) : str
  const splitDuration = duration.split('T')
  const period = stripFirstChar(splitDuration[0])
  const time = splitDuration[1]

  let output = 0
  if (isNonEmptyString(period)) output += parsePeriod(period)
  if (isNonEmptyString(time)) output += parseTime(time)
  return neg ? -output : output
}

export const convertToObject = str => {
  const neg = isNegative(str)
  const duration = neg ? stripFirstChar(str) : str
  const splitDuration = duration.split('T')
  const period = stripFirstChar(splitDuration[0])
  const time = splitDuration[1]

  let output = { [IS_NEGATIVE_UNIT]: neg }
  output = isNonEmptyString(period)
    ? Object.assign(output, parsePeriodToObject(period))
    : Object.assign(output, emptyPeriod)
  output = isNonEmptyString(time)
    ? Object.assign(output, parseTimeToObject(time))
    : Object.assign(output, emptyTime)
  return output
}

const out = (input, toObject = false) => {
  // Throw error for non-string input
  if (typeof input !== 'string') {
    throw new TypeError('expected input to be a string')
  }
  // Return null for invalid input
  if (!isValidXsdDuration(input)) return null
  // Parse valid input
  return toObject ? convertToObject(input) : parse(input)
}

export default (input, toObject) => out(input, toObject)
