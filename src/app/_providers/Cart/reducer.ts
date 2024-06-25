import type { CartItems, Product, User } from '../../../payload/payload-types'

export type CartItem = CartItems[0]

type CartType = User['cart'];

type CartAction =
  | {
      type: 'SET_CART'
      payload: CartType
    }
  | {
      type: 'MERGE_CART'
      payload: CartType
    }
  | {
      type: 'ADD_ITEM'
      payload: CartItem
    }
  | {
      type: 'DELETE_ITEM'
      payload: Product
      size: string
    }
  | {
      type: 'CLEAR_CART'
    }

export const cartReducer = (cart: CartType, action: CartAction): CartType => {
  switch (action.type) {
    case 'SET_CART': {
      return action.payload
    }

    case 'MERGE_CART': {
      const { payload: incomingCart } = action
      console.log('Incoming cart:', incomingCart)
      // console.log('cartitem 1 product:', incomingCart?.items[0].product)
      console.log('Existing cart:', cart)
      // console.log('cartitem 1 product:', incomingCart?.items[0].product)

      const mergedItems: CartItem[] = [...(cart?.items || []), ...(incomingCart?.items || [])]

      const uniqueItems: CartItem[] = mergedItems.reduce((acc: CartItem[], item) => {
        const duplicate = acc.find(
          accItem => accItem.size === item.size && accItem.product?.id === item.product?.id,
        )

        if (!item.product || typeof item.product !== 'object' || !item.size) {
          return acc;
        }

        if (!item.product.moreSizes.includes(item.size as "S" | "M" | "L" | "XL" )) {
          return acc;
        }

        if (!duplicate) {
          return [...acc, item]
        }

        return acc
      }, [])

      console.log('Unique cart:', uniqueItems)
      // console.log('cartitem 1 product:', incomingCart?.items[0].product)

      return {
        ...cart,
        items: uniqueItems,
      }
    }

    case 'ADD_ITEM': {
      // if the item is already in the cart, increase the quantity
      const { payload: incomingItem } = action
      const productId =
        typeof incomingItem.product === 'string' ? incomingItem.product : incomingItem?.product?.id

      const indexInCart = cart?.items?.findIndex(
        ({ product, size }) =>
          (typeof product === 'string' ? product === productId : product?.id === productId) &&
          size === incomingItem.size,
      ) // eslint-disable-line function-paren-newline

      let withAddedItem = [...(cart?.items || [])]

      if (indexInCart === -1) {
        withAddedItem.push(incomingItem)
      }

      if (typeof indexInCart === 'number' && indexInCart > -1) {
        withAddedItem[indexInCart] = {
          ...withAddedItem[indexInCart],
          quantity: (incomingItem.quantity || 0) > 0 ? incomingItem.quantity : undefined,
          size: incomingItem.size,
        }
      }

      return {
        ...cart,
        items: withAddedItem,
      }
    }

    case 'DELETE_ITEM': {
      const { payload: incomingProduct, size: incomingSize } = action
      const withDeletedItem = { ...cart }

      const indexInCart = cart?.items?.findIndex(
        ({ product, size }) =>
          (typeof product === 'string'
            ? product === incomingProduct.id
            : product?.id === incomingProduct.id) && size === incomingSize,
      ) // eslint-disable-line function-paren-newline

      if (typeof indexInCart === 'number' && withDeletedItem.items && indexInCart > -1)
        withDeletedItem.items.splice(indexInCart, 1)

      return withDeletedItem
    }

    case 'CLEAR_CART': {
      return {
        ...cart,
        items: [],
      }
    }

    default: {
      return cart
    }
  }
}
