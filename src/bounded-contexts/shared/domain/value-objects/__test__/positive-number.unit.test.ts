import { PositiveNumber } from '../positive-number'

describe('PositiveNumberValueObject', () => {
  it('should fail to create when provided with 0', () => {
    try {
      new PositiveNumber(0)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should succed to create when provided with > 0', () => {
    const num = new PositiveNumber(2)
    expect(num.value).toBe(2)
  })

  it('should sort in ascending order when using compare with asc order', () => {
    const list: Array<PositiveNumber> = [new PositiveNumber(3), new PositiveNumber(1), new PositiveNumber(2)]
    const sorted = [...list].sort((a, b) => a.compare(b))
    expect(sorted[0].value).toEqual(1)
    expect(sorted[sorted.length - 1].value).toEqual(3)
  })

  it('should sort in descending order when using compare with dec order', () => {
    const list: Array<PositiveNumber> = [new PositiveNumber(3), new PositiveNumber(1), new PositiveNumber(2)]
    const sorted = [...list].sort((a, b) => a.compare(b, 'DEC'))
    expect(sorted[0].value).toEqual(3)
    expect(sorted[sorted.length - 1].value).toEqual(1)
  })
})
