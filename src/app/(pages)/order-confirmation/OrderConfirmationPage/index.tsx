'use client'

import React, { Fragment, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '../../../_components/Button'
import { Message } from '../../../_components/Message'
import { useCart } from '../../../_providers/Cart'

import classes from './index.module.scss'

export const OrderConfirmationPage: React.FC<{}> = () => {
  const searchParams = useSearchParams()
  const orderID = searchParams.get('order_id')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const { clearCart } = useCart()

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Fetch order details from the server
        const orderResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${orderID}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        const orderData = await orderResponse.json()

        if (!orderResponse.ok) {
          setError('Error fetching order details')
          return
        }

        if (
          orderData.stripePaymentIntentID === 'Cash On Delivery' ||
          orderData.stripePaymentIntentID === 'PAID' ||
          status === 'PAID'
        ) {
          // If payment method is Cash On Delivery, directly set status as PAID
          setStatus('PAID')
        } else {
          // Otherwise, check payment status with Cashfree
          const response = await fetch(`/api/get-order/${orderID}`)
          const data = await response.json()

          // console.log(data)
          if (response.ok) {
            const paymentstatus = await fetch(`/api/get-payments-for-order/${orderID}`)
            const dat = await paymentstatus.json()
            const successfulPayment = dat.find(payment => payment.payment_status === 'SUCCESS')
            let discountPercentage = 0
            if (successfulPayment) {
              const { order_amount, payment_amount } = successfulPayment
              discountPercentage = Math.round(
                ((order_amount - payment_amount) / order_amount) * 100,
              )
            }
            setStatus(data.order_status)
            if (data.order_status === 'PAID') {
              // Update order status to 'PAID' & discount
              await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${orderID}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  stripePaymentIntentID: 'PAID',
                  discount: discountPercentage,
                }),
              })
              setStatus('PAID')
              clearCart()
            }
          } else {
            setError(data.message || 'Error fetching payment status')
          }
        }
      } catch (err) {
        setError('Error fetching payment status')
      }
    }

    if (orderID) {
      checkPaymentStatus()
    }
  }, [orderID, clearCart])

  return (
    <div>
      {error ? (
        <Fragment>
          <Message error={error} />
          <p>
            {`Your payment was successful but there was an error processing your order. Please contact us to resolve this issue.`}
          </p>
          <div className={classes.actions}>
            <Button href="/account" label="View account" appearance="primary" />
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/orders`}
              label="View all orders"
              appearance="secondary"
            />
          </div>
        </Fragment>
      ) : status === 'PAID' ? (
        <Fragment>
          <h1>Thank you for your order!</h1>
          <p>
            {`Your order has been confirmed. You will receive an email confirmation shortly. Order ID: ${orderID}`}
          </p>
          <div className={classes.actions}>
            <Button href={`/account/orders/${orderID}`} label="View order" appearance="primary" />
            <Button href="/account/orders" label="View all orders" appearance="secondary" />
          </div>
        </Fragment>
      ) : status === 'PENDING' ? (
        <Fragment>
          <Message error="Payment is pending" />
          <p>
            {`Your payment is currently pending. Please try again later or contact us for assistance.`}
          </p>
          <div className={classes.actions}>
            <Button href="/account" label="View account" appearance="primary" />
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/orders`}
              label="View all orders"
              appearance="secondary"
            />
          </div>
        </Fragment>
      ) : status === 'FAILED' ? (
        <Fragment>
          <Message error="Payment failed" />
          <p>{`Your payment was unsuccessful. Please try again or contact us for assistance.`}</p>
          <div className={classes.actions}>
            <Button href="/account" label="View account" appearance="primary" />
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/orders`}
              label="View all orders"
              appearance="secondary"
            />
          </div>
        </Fragment>
      ) : (
        <div className={classes.loading}></div>
      )}
    </div>
  )
}
