import React, { useCallback, useEffect, useRef } from 'react'
import { useForm, UseFormRegister } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { Order } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { Message } from '../../../_components/Message'
import { priceFromJSON } from '../../../_components/Price'
import { RadioButton } from '../../../_components/Radio'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { stateOptions } from '../../../constants'
import { createCashfreeOrder, initializeCashfree, openCashfreeCheckout } from './cashfreeHandler'

import classes from './index.module.scss'

type FormData = {
  contactnumber: string
  deliveryaddress: string
  city: string
  state: string
  pincode: string | number
}

interface CheckoutOptions {
  paymentSessionId: string
  redirectTarget: '_self' | '_blank' | '_top' | '_modal'
}

const CheckoutForm: React.FC<{}> = () => {
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [detailsConfirmed, setDetailsConfirmed] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<'payNow' | 'cod'>('payNow')
  const isSubmitting = useRef(false)
  const router = useRouter()
  const { cart, cartTotal } = useCart()
  const { user, setUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

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

  useEffect(() => {
    if (user) {
      reset({
        contactnumber: user.contactnumber || '',
        deliveryaddress: user.deliveryaddress || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      })
    }
  }, [user, reset])

  const handleFormSubmit = async (data: FormData) => {
    if (isSubmitting.current) return // Prevent duplicate submissions
    isSubmitting.current = true

    if (user) {
      setIsLoading(true)
      const userData = {
        ...data,
        email: user.email,
        name: user.name,
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          credentials: 'include',
          method: 'PATCH',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          setError('')
          setIsLoading(false)
          setDetailsConfirmed(true) // Confirm details on successful form submission
        } else {
          setError('There was a problem updating your account.')
          setIsLoading(false)
        }
      } catch (err) {
        setError(`Error updating account: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsLoading(false)
      } finally {
        isSubmitting.current = false
      }
    }
  }

  const handleSubmitCheckout = useCallback(async () => {
    if (isSubmitting.current) return // Prevent duplicate submissions
    isSubmitting.current = true
    setIsLoading(true)

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
          items: (cart?.items || []).map(({ product, quantity, size }) => ({
            product: typeof product === 'string' ? product : product.id,
            quantity,
            size,
            price:
              typeof product === 'object' ? priceFromJSON(product.priceJSON, 1, true) : undefined,
          })),
        }),
      })

      if (!orderReq.ok) throw new Error(orderReq.statusText || 'Something went wrong.')

      const { error: errorFromRes, doc }: { message?: string; error?: string; doc: Order } =
        await orderReq.json()

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
      const { paymentSessionId } = cashfreeResponse

      if (paymentSessionId) {
        // Open payment page in a modal popup
        const checkoutOptions: CheckoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: '_self',
        }
        openCashfreeCheckout(checkoutOptions).then(
          async (result: { error?: Error; paymentDetails?: any }) => {
            if (result.error) {
              setError(`Error: ${result.error.message}`)
            }
            if (result.paymentDetails) {
              router.push(`/order-confirmation?order_id=${doc.id}`)
            }
          },
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(`Error while submitting payment: ${msg}`)
    } finally {
      setIsLoading(false)
      isSubmitting.current = false
    }
  }, [router, cart, cartTotal, user])

  const handleCashOnDelivery = useCallback(async () => {
    if (isSubmitting.current) return // Prevent duplicate submissions
    isSubmitting.current = true
    setIsLoading(true)

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
          stripePaymentIntentID: 'Cash On Delivery',
          items: (cart?.items || []).map(({ product, quantity, size }) => ({
            product: typeof product === 'string' ? product : product.id,
            quantity,
            size,
            price:
              typeof product === 'object' ? priceFromJSON(product.priceJSON, 1, true) : undefined,
          })),
        }),
      })

      if (!orderReq.ok) throw new Error(orderReq.statusText || 'Something went wrong.')

      const { error: errorFromRes, doc }: { message?: string; error?: string; doc: Order } =
        await orderReq.json()

      if (errorFromRes) throw new Error(errorFromRes)

      router.push(`/order-confirmation?order_id=${doc.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(`Error while creating order: ${msg}`)
    } finally {
      setIsLoading(false)
      isSubmitting.current = false
    }
  }, [router, cart, cartTotal])

  const handlePaymentMethodChange = (method: 'payNow' | 'cod') => {
    setPaymentMethod(method)
  }

  return (
    <>
      {!detailsConfirmed ? (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={classes.form}>
          <Message error={error} />
          <Input
            name="contactnumber"
            label="Contact Number"
            register={register}
            required
            error={errors.contactnumber}
            type="text"
          />
          <Input
            name="deliveryaddress"
            label="Delivery Address"
            register={register}
            required
            error={errors.deliveryaddress}
            type="text"
          />
          <Input
            name="city"
            label="City"
            register={register}
            required
            error={errors.city}
            type="text"
          />
          <Select
            name="state"
            label="State"
            register={register}
            required
            error={errors.state}
            options={stateOptions}
          />
          <Input
            name="pincode"
            label="PIN Code"
            register={register}
            required
            error={errors.pincode}
            type="text"
          />
          <Message error={error} />
          <Button
            type="submit"
            label={isLoading ? 'Loading...' : 'Confirm Details'}
            disabled={isLoading}
            appearance="primary"
            className={classes.submit}
          />
        </form>
      ) : (
        <div className={classes.actions}>
          <Message error={error} />
          <div className={classes.paymentMethods}>
            <RadioButton
              label="Pay Online"
              value="payNow"
              isSelected={paymentMethod === 'payNow'}
              onRadioChange={() => handlePaymentMethodChange('payNow')}
              groupName="paymentMethod"
            />
            <RadioButton
              label="Cash on Delivery"
              value="cod"
              isSelected={paymentMethod === 'cod'}
              onRadioChange={() => handlePaymentMethodChange('cod')}
              groupName="paymentMethod"
            />
          </div>
          <Button
            type="button"
            label={isLoading ? 'Loading...' : 'Confirm Payment Method'}
            disabled={isLoading || !paymentMethod}
            onClick={
              paymentMethod === 'payNow'
                ? handleSubmitCheckout
                : paymentMethod === 'cod'
                ? handleCashOnDelivery
                : undefined
            }
            appearance="primary"
            className={classes.submit}
          />
          <Button
            type="button"
            label="Edit Details"
            onClick={() => setDetailsConfirmed(false)}
            appearance="secondary"
            className={classes.submit}
          />
          <Button
            type="button"
            label="Cancel"
            onClick={() => router.push('/cart')}
            appearance="secondary"
            className={classes.submit}
          />
        </div>
      )}
    </>
  )
}

interface InputProps {
  name: keyof FormData // Use keyof FormData to ensure type safety
  label: string
  register: UseFormRegister<FormData>
  required: boolean
  error?: any
  type: string
}

const Input: React.FC<InputProps> = ({ name, label, register, required, error, type }) => (
  <div className={classes.field}>
    <label htmlFor={name}>{label}</label>
    <input
      type={type}
      id={name}
      {...register(name, { required })}
      aria-invalid={error ? 'true' : 'false'}
    />
    {error && <span role="alert">This field is required</span>}
  </div>
)

interface SelectProps {
  name: keyof FormData // Use keyof FormData to ensure type safety
  label: string
  register: UseFormRegister<FormData>
  required: boolean
  error?: any
  options: { label: string; value: string }[]
}

const Select: React.FC<SelectProps> = ({ name, label, register, required, error, options }) => (
  <div className={classes.field}>
    <label htmlFor={name}>{label}</label>
    <select id={name} {...register(name, { required })} aria-invalid={error ? 'true' : 'false'}>
      <option value="">Select...</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span role="alert">This field is required</span>}
  </div>
)

export default CheckoutForm
