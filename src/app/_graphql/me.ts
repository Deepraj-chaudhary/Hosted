import { CART } from './cart'

export const ME_QUERY = `query {
  meUser {
    user {
      id
      email
      name
      contactnumber
      ${CART}
      roles
    }
    exp
  }
}`
