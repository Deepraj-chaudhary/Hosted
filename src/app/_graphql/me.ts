import { CART } from './cart'

export const ME_QUERY = `query {
  meUser {
    user {
      id
      email
      name
      contactnumber
      deliveryaddress
      city
      state
      pincode
      ${CART}
      roles
    }
    exp
  }
}`
