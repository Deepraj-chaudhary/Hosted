'use client'

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Order, User } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { Message } from '../../../_components/Message'
import { useCart } from '../../../_providers/Cart'
import { createDTDCOrder } from '../../../_utilities/createDTDCOrder'

import classes from './index.module.scss'

const fetchUserDetails = async (): Promise<User> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (res.ok) {
    const { user } = await res.json()
    return user
  } else {
    throw new Error('An error occurred while fetching your account.')
  }
}

const updateOrderStatus = async (
  orderID: string,
  discount: number,
  reference_number: string | undefined,
  paymentstatus: string,
) => {
  await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${orderID}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stripePaymentIntentID: paymentstatus,
      discount: discount,
      reference_number: reference_number,
    }),
  })
}

const fetchOrderDetails = async (orderID: string): Promise<Order> => {
  const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${orderID}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!orderResponse.ok) {
    throw new Error('Error fetching order details')
  }

  const orderData = await orderResponse.json()
  return orderData
}

const checkPaymentStatusWithCashfree = async (orderID: string) => {
  const response = await fetch(`/api/get-order/${orderID}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error fetching payment status')
  }

  const paymentStatusResponse = await fetch(`/api/get-payments-for-order/${orderID}`)
  const paymentStatusData = await paymentStatusResponse.json()
  const successfulPayment = paymentStatusData.find(
    (payment: any) => payment.payment_status === 'SUCCESS',
  )

  let discountPercentage = 0
  if (successfulPayment) {
    const { order_amount, payment_amount } = successfulPayment
    discountPercentage = Math.round(((order_amount - payment_amount) / order_amount) * 100)
  }

  return { order_status: data.order_status, discountPercentage }
}

export const OrderConfirmationPage: React.FC<{}> = () => {
  const searchParams = useSearchParams()
  const orderID = searchParams.get('order_id')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const isCheckingPaymentStatus = useRef(false)
  const { clearCart } = useCart()

  const createAndUpdateDTDCOrder = useCallback(
    async (orderData: Order, discountPercentage: number, order_status: string) => {
      try {
        const user = await fetchUserDetails()
        const reference_number = null

        await updateOrderStatus(orderID!, discountPercentage, reference_number, order_status)
        clearCart()
        setStatus('PAID')
      } catch (error) {
        setError('Error creating DTDC order')
      }
    },
    [clearCart, orderID],
  )

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (isCheckingPaymentStatus.current) return
      isCheckingPaymentStatus.current = true

      try {
        const orderData = await fetchOrderDetails(orderID!)

        if (
          (orderData.stripePaymentIntentID === 'Cash On Delivery' ||
            orderData.stripePaymentIntentID === 'PAID') &&
          !orderData.reference_number
        ) {
          await createAndUpdateDTDCOrder(orderData, orderData.discount, 'Cash On Delivery')
        } else if (
          (orderData.stripePaymentIntentID === 'Cash On Delivery' ||
            orderData.stripePaymentIntentID === 'PAID') &&
          orderData.reference_number
        ) {
          setStatus('PAID')
        } else {
          const { order_status, discountPercentage } = await checkPaymentStatusWithCashfree(
            orderID!,
          )
          if (order_status === 'PAID') {
            await createAndUpdateDTDCOrder(orderData, discountPercentage, 'PAID')
          } else {
            setStatus(order_status)
          }
        }
      } catch (err) {
        setError('Error fetching payment status')
      } finally {
        isCheckingPaymentStatus.current = false
      }
    }

    if (orderID) {
      checkPaymentStatus()
    }
  }, [orderID, createAndUpdateDTDCOrder])

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
      ) : status === 'ACTIVE' ? (
        <div>
          <div className={classes.loading}></div>
          <p>{`Your payment is currently active. Waiting for payment confirmation.`}</p>
        </div>
      ) : (
        <div className={classes.loading}></div>
      )}
    </div>
  )
}
