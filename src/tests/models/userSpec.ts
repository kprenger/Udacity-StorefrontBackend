import client from '../../database'
import { User, UserStore } from '../../models/user'

const userStore = new UserStore()

const user1: User = {
  firstName: 'Test',
  lastName: 'User1',
  username: 'tuser1',
  password: 'password123'
}

const user2: User = {
  firstName: 'Test',
  lastName: 'User2',
  username: 'tuser2',
  password: 'password321'
}

const user3: User = {
  firstName: 'Test',
  lastName: 'User3',
  username: 'tuser3',
  password: 'password999'
}

describe('User Model', () => {
  afterEach(async () => {
    const conn = await client.connect()
    await conn.query('DELETE FROM users')
    conn.release()
  })

  describe('index method', () => {
    it('should return an empty array if no users', async () => {
      const userList = await userStore.index()

      expect(userList.length).toBe(0)
    })

    it('should return all users', async () => {
      await Promise.all([
        userStore.create(user1),
        userStore.create(user2),
        userStore.create(user3)
      ])

      const results = await userStore.index()

      const resultsUsernames = results.map((item) => item.username)

      expect(results.length).toBe(3)
      expect(resultsUsernames.includes(user1.username)).toBeTrue()
      expect(resultsUsernames.includes(user2.username)).toBeTrue()
      expect(resultsUsernames.includes(user3.username)).toBeTrue()
    })
  })

  describe('show method', () => {
    it('should return a specific user', async () => {
      await userStore.create(user1)
      const user2Return = await userStore.create(user2)
      await userStore.create(user3)

      const result = await userStore.show(user2Return.id!)

      expect(result!.username).toEqual(user2.username)
    })

    it('should return undefined if no user found', async () => {
      await Promise.all([
        userStore.create(user1),
        userStore.create(user2),
        userStore.create(user3)
      ])

      const result = await userStore.show(999)

      expect(result).toBeUndefined()
    })
  })

  describe('create method', () => {
    it('should create new user', async () => {
      const newUser = await userStore.create(user1)

      expect(newUser.username).toEqual(user1.username)

      const showUser = await userStore.show(newUser.id!)

      expect(showUser?.username).toEqual(user1.username)
    })

    it('should throw if there is no password', async () => {
      const userNoPassword = {
        firstName: 'Test',
        lastName: 'User5',
        username: 'tuser5'
      }

      await expectAsync(userStore.create(userNoPassword)).toBeRejectedWith(
        new Error('A password must be specified to create a new user.')
      )
    })
  })

  describe('authenticate method', () => {
    it('should return the user if authenticated', async () => {
      await Promise.all([
        userStore.create(user1),
        userStore.create(user2),
        userStore.create(user3)
      ])

      const result = await userStore.authenticate(
        user3.username,
        user3.password!
      )

      expect(result?.username).toEqual(user3.username)
    })

    it('should return undefined if not authenticated', async () => {
      await Promise.all([
        userStore.create(user1),
        userStore.create(user2),
        userStore.create(user3)
      ])

      const result = await userStore.authenticate(
        user3.username,
        user2.password!
      )

      expect(result).toBeUndefined()
    })
  })
})
