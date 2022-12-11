import { NonEmptyString } from '../non-empty-string'

describe('NonEmptyStringValueObject', () => {
  it('should fail to create when provided with empty string', () => {
    try {
      new NonEmptyString('')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should succed to create when provided with "some string"', () => {
    const num = new NonEmptyString('some string')
    expect(num.value).toBe('some string')
  })

  it('should sort in ascending order when using compare with asc order', () => {
    const list: Array<NonEmptyString> = [new NonEmptyString('b'), new NonEmptyString('a'), new NonEmptyString('c')]
    const sorted = [...list].sort((a, b) => a.compare(b))
    expect(sorted[0].value).toEqual('a')
    expect(sorted[sorted.length - 1].value).toEqual('c')
  })

  it('should sort in descending order when using compare with dec order', () => {
    const list: Array<NonEmptyString> = [new NonEmptyString('b'), new NonEmptyString('a'), new NonEmptyString('c')]
    const sorted = [...list].sort((a, b) => a.compare(b, 'DEC'))
    expect(sorted[0].value).toEqual('c')
    expect(sorted[sorted.length - 1].value).toEqual('a')
  })
})
