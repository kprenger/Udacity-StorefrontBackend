import { UserStore } from '../../models/user'

const userStore = new UserStore()

describe('User Model', () => {
  describe('index method', () => {
    it('should have an index method', () => {
      expect(userStore.index).toBeDefined()
    })

    it('should return an empty array if no users', async () => {
      const userList = await userStore.index()

      expect(userList.length).toBe(0)
    })
  })
})
