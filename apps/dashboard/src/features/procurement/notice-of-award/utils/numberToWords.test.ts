import { describe, expect, it } from 'vitest'
import { numberToPhilippinePesoWords } from './numberToWords'

describe('numberToPhilippinePesoWords', () => {
  it('converts sample USTP NOA amount (3,198,600.00) accurately', () => {
    const result = numberToPhilippinePesoWords(3198600)
    expect(result).toBe(
      'THREE MILLION ONE HUNDRED NINETY-EIGHT THOUSAND SIX HUNDRED PESOS AND 00/100 (?3,198,600.00) ONLY',
    )
  })

  it('converts amounts with cents accurately', () => {
    const result = numberToPhilippinePesoWords(250000.5)
    expect(result).toBe(
      'TWO HUNDRED FIFTY THOUSAND PESOS AND 50/100 (?250,000.50) ONLY',
    )
  })

  it('handles zero correctly', () => {
    const result = numberToPhilippinePesoWords(0)
    expect(result).toBe('ZERO PESOS AND 00/100 (?0.00) ONLY')
  })
})
