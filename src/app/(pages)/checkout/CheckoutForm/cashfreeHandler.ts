// cashfreeHandler.ts
import { load } from '@cashfreepayments/cashfree-js'

interface Cashfree {
  checkout: (options: CheckoutOptions) => any
}

let cashfree: Cashfree | null = null

export const initializeCashfree = async (): Promise<Cashfree | null> => {
  try {
    cashfree = (await load({
      mode: 'production',
    })) as Cashfree
    return cashfree
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Failed to load Cashfree.js')
    }
  }
}

interface OrderData {
  order_amount: number
  order_currency: string
  order_id: string
  customer_details: {
    customer_id: string
    customer_phone: string
    customer_email: string
    customer_name: string
  }
  order_meta: {
    return_url: string
  }
}

export const createCashfreeOrder = async (orderData: OrderData): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-order`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) throw new Error(`Failed to create Cashfree order. ${response.statusText}`)

    const data = await response.json()
    return data
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to create Cashfree order.')
    }
  }
}

interface CheckoutOptions {
  paymentSessionId: string
  redirectTarget: '_self' | '_blank' | '_top' | '_modal'
}

export const openCashfreeCheckout = (checkoutOptions: CheckoutOptions): any => {
  return cashfree.checkout(checkoutOptions)
}
