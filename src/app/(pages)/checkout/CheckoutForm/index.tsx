// index.tsx
'use client'

import React, { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Order } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { Message } from '../../../_components/Message'
import { priceFromJSON } from '../../../_components/Price'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { createCashfreeOrder, initializeCashfree, openCashfreeCheckout } from './cashfreeHandler'

import classes from './index.module.scss'

type CheckoutOptions = {
  paymentSessionId: string
  redirectTarget: '_self' | '_blank' | '_top' | '_modal'
}

const CheckoutForm: React.FC<{}> = () => {
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const { cart, cartTotal } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const initCashfree = async () => {
      try {
        await initializeCashfree()
      } catch (err) {
        setError(
          `Error initializing Cashfree: ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      }
    }

    initCashfree()
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsLoading(true)

      // Validate user profile
      if (
        !user.deliveryaddress ||
        !user.pincode ||
        !user.contactnumber ||
        !user.state ||
        !user.city
      ) {
        setError('Please complete your profile before proceeding to checkout')
        setIsLoading(false)
        return
      }

      try {
        // Proceed with creating the order in Payload CMS
        const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total: cartTotal.raw,
            stripePaymentIntentID: 'Not Paid',
            items: (cart?.items || [])?.map(({ product, quantity, size }) => ({
              product: typeof product === 'string' ? product : product.id,
              quantity,
              size,
              price:
                typeof product === 'object' ? priceFromJSON(product.priceJSON, 1, true) : undefined,
            })),
          }),
        })

        if (!orderReq.ok) throw new Error(orderReq.statusText || 'Something went wrong.')

        const {
          error: errorFromRes,
          doc,
        }: {
          message?: string
          error?: string
          doc: Order
        } = await orderReq.json()

        if (errorFromRes) throw new Error(errorFromRes)

        // Prepare order data for Cashfree
        const orderData = {
          order_amount: cartTotal.raw / 100,
          order_currency: 'INR',
          order_id: doc.id,
          customer_details: {
            customer_id: user.id,
            customer_phone: user.contactnumber,
            customer_email: user.email,
            customer_name: user.name,
          },
          order_meta: {
            return_url: `${window.location.origin}/order-confirmation?order_id=${doc.id}`,
          },
        }

        // Create order with Cashfree
        const cashfreeResponse = await createCashfreeOrder(orderData)
        // console.log('Cashfree response:', cashfreeResponse)
        const { paymentSessionId } = cashfreeResponse

        if (paymentSessionId) {
          // Open payment page in a modal popup
          const checkoutOptions: CheckoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: '_self',
          }
          // console.log('Opening Cashfree checkout:', checkoutOptions)
          openCashfreeCheckout(checkoutOptions).then(
            async (result: { error?: Error; paymentDetails?: any }) => {
              if (result.error) {
                // Handle errors
                // console.log(
                //   'User has closed the popup or there is some payment error, Check for Payment Status',
                // )
                // console.log(result.error)
                setError(`Error: ${result.error.message}`)
              }
              if (result.paymentDetails) {
                // Redirect to order confirmation page after successful payment
                router.push(`/order-confirmation?order_id=${doc.id}`)
              }
            },
          )
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setError(`Error while submitting payment: ${msg}`)
        setIsLoading(false)
      }
    },
    [router, cart, cartTotal, user],
  )

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      {error && <Message error={error} />}
      <div className={classes.actions}>
        <Button label="Back to cart" href="/cart" appearance="secondary" />
        <Button
          label={isLoading ? 'Loading...' : 'Pay Now'}
          type="submit"
          appearance="primary"
          disabled={isLoading}
        />
      </div>
    </form>
  )
}

export default CheckoutForm
