'use client'

import React, { useEffect, useState } from 'react'

import { Product } from '../../../payload/payload-types'

import classes from './index.module.scss'

export const priceFromJSON = (
  priceJSON: string,
  quantity: number = 1,
  raw?: boolean,
): { originalPrice: string; modifiedPrice: string } => {
  let originalPrice = ''
  let modifiedPrice = ''

  if (priceJSON) {
    try {
      const parsed = JSON.parse(priceJSON)?.data[0]
      const priceValue = parsed.unit_amount * quantity
      const priceType = parsed.type

      if (raw)
        return {
          originalPrice: priceValue.toString(),
          modifiedPrice: (priceValue + 100 * quantity).toString(),
        }

      originalPrice = (priceValue / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'INR', // TODO: use `parsed.currency`
      })

      modifiedPrice = ((priceValue + 10000 * quantity) / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'INR', // TODO: use `parsed.currency`
      })

      if (priceType === 'recurring') {
        originalPrice += `/${
          parsed.recurring.interval_count > 1
            ? `${parsed.recurring.interval_count} ${parsed.recurring.interval}`
            : parsed.recurring.interval
        }`
        modifiedPrice += `/${
          parsed.recurring.interval_count > 1
            ? `${parsed.recurring.interval_count} ${parsed.recurring.interval}`
            : parsed.recurring.interval
        }`
      }
    } catch (e) {
      console.error(`Cannot parse priceJSON`) // eslint-disable-line no-console
    }
  }

  return { originalPrice, modifiedPrice }
}

export const Price: React.FC<{
  product: Product
  quantity?: number
  size?: string
  button?: 'addToCart' | 'removeFromCart' | false
}> = props => {
  const { product, product: { priceJSON } = {}, button = 'addToCart', quantity, size } = props

  const [price, setPrice] = useState<{
    originalPrice: string
    modifiedPrice: string
  }>(() => priceFromJSON(priceJSON, quantity))

  useEffect(() => {
    setPrice(priceFromJSON(priceJSON, quantity))
  }, [priceJSON, quantity])

  return (
    <div className={classes.actions}>
      {typeof price?.originalPrice !== 'undefined' && price?.modifiedPrice !== '' && (
        <div className={classes.price}>
          <p className={classes.modifiedPrice}>{price?.modifiedPrice}</p>
          <p>{price?.originalPrice}</p>
        </div>
      )}
    </div>
  )
}
