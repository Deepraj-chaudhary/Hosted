'use client'

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { Button } from '../../../_components/Button'
import { Input } from '../../../_components/Input'
import { Message } from '../../../_components/Message'
import { useAuth } from '../../../_providers/Auth'

import classes from './index.module.scss'

const stateOptions = [
  { label: 'JAMMU AND KASHMIR', value: '1' },
  { label: 'HIMACHAL PRADESH', value: '2' },
  { label: 'PUNJAB', value: '3' },
  { label: 'CHANDIGARH', value: '4' },
  { label: 'UTTARAKHAND', value: '5' },
  { label: 'HARYANA', value: '6' },
  { label: 'DELHI', value: '7' },
  { label: 'RAJASTHAN', value: '8' },
  { label: 'UTTAR PRADESH', value: '9' },
  { label: 'BIHAR', value: '10' },
  { label: 'SIKKIM', value: '11' },
  { label: 'ARUNACHAL PRADESH', value: '12' },
  { label: 'NAGALAND', value: '13' },
  { label: 'MANIPUR', value: '14' },
  { label: 'MIZORAM', value: '15' },
  { label: 'TRIPURA', value: '16' },
  { label: 'MEGHALAYA', value: '17' },
  { label: 'ASSAM', value: '18' },
  { label: 'WEST BENGAL', value: '19' },
  { label: 'JHARKHAND', value: '20' },
  { label: 'ORISSA', value: '21' },
  { label: 'CHHATTISGARH', value: '22' },
  { label: 'MADHYA PRADESH', value: '23' },
  { label: 'GUJARAT', value: '24' },
  { label: 'DADAR AND NAGAR HAVELI & DAMAN AND DIU', value: '26' },
  { label: 'MAHARASHTRA', value: '27' },
  { label: 'KARNATAKA', value: '29' },
  { label: 'GOA', value: '30' },
  { label: 'LAKSHADWEEP', value: '31' },
  { label: 'KERALA', value: '32' },
  { label: 'TAMIL NADU', value: '33' },
  { label: 'PUDUCHERRY', value: '34' },
  { label: 'ANDAMAN AND NICOBAR', value: '35' },
  { label: 'TELANGANA', value: '36' },
  { label: 'ANDHRA PRADESH', value: '37' },
  { label: 'LADAKH', value: '38' },
  { label: 'OTHER TERRITORY', value: '97' },
  { label: 'OTHER COUNTRY', value: '99' },
]

type FormData = {
  email: string
  name: string
  contactnumber: string
  deliveryaddress: string
  city: string
  state: string
  pincode: number
  password: string
  passwordConfirm: string
}

const AccountForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user, setUser } = useAuth()
  const [changePassword, setChangePassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          // Make sure to include cookies with fetch
          credentials: 'include',
          method: 'PATCH',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          setSuccess('Successfully updated account.')
          setError('')
          setChangePassword(false)
          reset({
            email: json.doc.email,
            name: json.doc.name,
            contactnumber: json.doc.contactnumber,
            deliveryaddress: json.doc.deliveryaddress,
            city: json.doc.city,
            state: json.doc.state,
            pincode: json.doc.pincode,
            password: '',
            passwordConfirm: '',
          })
        } else {
          setError('There was a problem updating your account.')
        }
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      reset({
        email: user.email,
        name: user.name,
        contactnumber: user.contactnumber,
        deliveryaddress: user.deliveryaddress,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, router, reset, changePassword])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
      <Message error={error} success={success} className={classes.message} />
      {!changePassword ? (
        <Fragment>
          <Input
            name="email"
            label="Email Address"
            required
            register={register}
            error={errors.email}
            type="email"
          />
          <Input name="name" label="Name" register={register} error={errors.name} />
          <Input
            name="contactnumber"
            label="Contact Number"
            register={register}
            required
            error={errors.contactnumber}
            type="contactnumber"
          />
          <Input
            name="deliveryaddress"
            label="Delivery Address"
            register={register}
            required
            error={errors.deliveryaddress}
            type="text"
          />
          <Input name="city" label="City" register={register} error={errors.city} type="text" />
          <div className={classes.selectWrapper}>
            <label htmlFor="state">State</label>
            <select
              name="state"
              id="state"
              {...register('state', { required: true })}
              className={errors.state ? classes.error : ''}
            >
              {stateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.state && <p className={classes.errorMessage}>State is required</p>}
          </div>
          <Input
            name="pincode"
            label="Pincode"
            register={register}
            required
            error={errors.pincode}
            type="number"
          />

          <p>
            {'Change your account details below, or '}
            <button
              type="button"
              className={classes.changePassword}
              onClick={() => setChangePassword(!changePassword)}
            >
              click here
            </button>
            {' to change your password.'}
          </p>
        </Fragment>
      ) : (
        <Fragment>
          <p>
            {'Change your password below, or '}
            <button
              type="button"
              className={classes.changePassword}
              onClick={() => setChangePassword(!changePassword)}
            >
              cancel
            </button>
            .
          </p>
          <Input
            name="password"
            type="password"
            label="Password"
            required
            register={register}
            error={errors.password}
          />
          <Input
            name="passwordConfirm"
            type="password"
            label="Confirm Password"
            required
            register={register}
            validate={value => value === password.current || 'The passwords do not match'}
            error={errors.passwordConfirm}
          />
        </Fragment>
      )}
      <Button
        type="submit"
        label={isLoading ? 'Processing' : changePassword ? 'Change Password' : 'Update Account'}
        disabled={isLoading}
        appearance="primary"
        className={classes.submit}
      />
    </form>
  )
}

export default AccountForm
