import { Request, Response } from 'express'
import {
  verifyAuthToken,
  verifyCurrentUser
} from '../../utilities/verification'

describe('Verification utility', () => {
  describe('verifyAuthToken method', () => {
    it('should fail if the JWT cannot be verified', () => {
      const req = {
        headers: {
          authorization: 'Bearer: IncorrectToken'
        }
      }

      let statusCall = 200
      let jsonCall = { message: '' }
      const res = {
        locals: { userId: 12 },
        status: (item: number) => {
          statusCall = item
        },
        json: (item: { message: string }) => {
          jsonCall = item
        }
      }

      verifyAuthToken(
        req as unknown as Request,
        res as unknown as Response,
        () => {
          fail('The next method should not be called')
        }
      )

      expect(statusCall).toEqual(401)
      expect(jsonCall.message).not.toEqual('')
    })
  })

  describe('verifyCurrentUser method', () => {
    it('should validate the current user', () => {
      const req = {
        params: {
          id: '12'
        }
      }

      const res = {
        locals: { userId: 12 },
        status: () => {
          fail('status should not be called')
        },
        json: (item: string) => {
          fail(item)
        }
      }

      let nextCalled = false

      verifyCurrentUser(
        req as unknown as Request,
        res as unknown as Response,
        () => {
          nextCalled = true
        }
      )

      expect(nextCalled).toBeTrue()
    })

    it(`should fail if the user id's do not match`, () => {
      const req = {
        params: {
          id: '12'
        }
      }

      let statusCall = 200
      let jsonCall = { message: '' }
      const res = {
        locals: { userId: 13 },
        status: (item: number) => {
          statusCall = item
        },
        json: (item: { message: string }) => {
          jsonCall = item
        }
      }

      verifyCurrentUser(
        req as unknown as Request,
        res as unknown as Response,
        () => {
          fail('The next method should not be called')
        }
      )

      expect(statusCall).toEqual(401)
      expect(jsonCall.message).toEqual(
        'You cannot perform this request on a different user'
      )
    })
  })
})
