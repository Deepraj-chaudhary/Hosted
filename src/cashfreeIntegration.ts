import { Cashfree } from 'cashfree-pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET
Cashfree.XEnvironment =
  process.env.CASHFREE_ENVIRONMENT === 'production'
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX

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

export const createOrder = async (
  orderData: OrderData,
): Promise<{ paymentSessionId: string; order_id: string }> => {
  const { order_amount, order_currency, order_id, customer_details, order_meta } = orderData
  try {
    const response = await Cashfree.PGCreateOrder('2023-08-01', {
      order_amount,
      order_currency,
      order_id,
      customer_details,
      order_meta,
    })
    return {
      paymentSessionId: response.data.payment_session_id,
      order_id: order_id,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Failed to create order')
    }
  }
}

export const getOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await Cashfree.PGFetchOrder('2023-08-01', orderId)
    return response.data
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Failed to fetch order')
    }
  }
}

export const getPaymentsForOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await Cashfree.PGOrderFetchPayments('2023-08-01', orderId)
    return response.data
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Failed to fetch payment details for order')
    }
  }
}

// export const validateWebhook = (req: {headers: any, rawBody: any}): boolean => {
//   try {
//     Cashfree.PGVerifyWebhookSignature(
//       req.headers['x-webhook-signature'],
//       req.rawBody,
//       req.headers['x-webhook-timestamp'],
//     )
//     return true
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       return false
//     }
//   }
// }
