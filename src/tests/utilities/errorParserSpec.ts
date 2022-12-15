import { parseError } from '../../utilities/errorParser'

describe('Error Parser utility', () => {
  it('should parse an error', () => {
    const message = 'This is an error message'
    const err = new Error(message)

    const parsedError = parseError(err)

    expect(parsedError.message).toEqual(message)
  })

  it('should return an empty error if a non-Error is passed in', () => {
    const parsedError = parseError('this is a string, not an Error')

    expect(parsedError.message).toEqual('')
  })
})
