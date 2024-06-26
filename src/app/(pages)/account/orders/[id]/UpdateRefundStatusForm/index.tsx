'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { Button } from '../../../../../_components/Button'
import { Input } from '../../../../../_components/Input'
import { Message } from '../../../../../_components/Message'

import classes from './index.module.scss'

type FormData = {
  refundMessage: string
}

const UpdateRefundStatusForm: React.FC<{ orderId: string; token: string }> = ({
  orderId,
  token,
}) => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>()

  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ refund: 'Refunding', refundMessage: data.refundMessage }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
    })

    if (response.ok) {
      setSuccess('Successfully updated refund status.')
      setError('')
      router.refresh() // Refresh the page to show the updated status
      reset() // Reset the form
    } else {
      setError('There was a problem updating the refund status.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
      <Message error={error} success={success} />
      <Input
        name="refundMessage"
        label="Why would you like to refund this order?"
        required
        register={register}
        error={errors.refundMessage}
        type="text"
      />
      <Button
        type="submit"
        label={isSubmitting ? 'Processing' : 'Request Refund'}
        disabled={isSubmitting}
        appearance="primary"
        // className={classes.submit}
      />
    </form>
  )
}

export default UpdateRefundStatusForm
