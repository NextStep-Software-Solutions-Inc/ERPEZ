/**
 * Converts a numeric currency amount into official Philippine Peso words format
 * per standard Philippine government (COA / GPPB) document standards.
 *
 * Example:
 * 3198600.00 -> "THREE MILLION ONE HUNDRED NINETY-EIGHT THOUSAND SIX HUNDRED PESOS AND 00/100 (?3,198,600.00) ONLY"
 */

const ONES = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
]

const TENS = [
  '',
  '',
  'TWENTY',
  'THIRTY',
  'FORTY',
  'FIFTY',
  'SIXTY',
  'SEVENTY',
  'EIGHTY',
  'NINETY',
]

const SCALES = ['', 'THOUSAND', 'MILLION', 'BILLION', 'TRILLION']

function convertChunk(num: number): string {
  let result = ''

  const hundreds = Math.floor(num / 100)
  const remainder = num % 100

  if (hundreds > 0) {
    result += `${ONES[hundreds]} HUNDRED `
  }

  if (remainder > 0) {
    if (remainder < 20) {
      result += ONES[remainder]
    } else {
      const ten = Math.floor(remainder / 10)
      const one = remainder % 10
      result += TENS[ten]
      if (one > 0) {
        result += `-${ONES[one]}`
      }
    }
  }

  return result.trim()
}

export function numberToPhilippinePesoWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'ZERO PESOS AND 00/100 (?0.00) ONLY'
  }

  const absoluteAmount = Math.abs(amount)
  const integerPart = Math.floor(absoluteAmount)
  const cents = Math.round((absoluteAmount - integerPart) * 100)

  let words = ''

  if (integerPart === 0) {
    words = 'ZERO'
  } else {
    let currentNumber = integerPart
    let scaleIndex = 0

    const parts: string[] = []

    while (currentNumber > 0) {
      const chunk = currentNumber % 1000
      if (chunk > 0) {
        const chunkWords = convertChunk(chunk)
        const scale = SCALES[scaleIndex]
        parts.unshift(scale ? `${chunkWords} ${scale}` : chunkWords)
      }
      currentNumber = Math.floor(currentNumber / 1000)
      scaleIndex++
    }

    words = parts.join(' ')
  }

  const centsString = cents.toString().padStart(2, '0')
  const formattedFigures = `?${absoluteAmount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

  return `${words} PESOS AND ${centsString}/100 (${formattedFigures}) ONLY`
}
