import React, { Fragment } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Order } from '../../../../../payload/payload-types'
import CopyToClipboardIcon from '../../../../_components/CopyToClipboardIcon'
import { HR } from '../../../../_components/HR'
import { Media } from '../../../../_components/Media'
import { Price } from '../../../../_components/Price'
import { formatDateTime } from '../../../../_utilities/formatDateTime'
import { getMeUser } from '../../../../_utilities/getMeUser'
import { mergeOpenGraph } from '../../../../_utilities/mergeOpenGraph'
import UpdateRefundStatusForm from './UpdateRefundStatusForm'

import classes from './index.module.scss'

export default async function Order({ params: { id } }) {
  const { token } = await getMeUser({
    nullUserRedirect: `/login?error=${encodeURIComponent(
      'You must be logged in to view this order.',
    )}&redirect=${encodeURIComponent(`/order/${id}`)}`,
  })

  let order: Order | null = null

  try {
    order = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
    })?.then(async res => {
      if (!res.ok) notFound()
      const json = await res.json()
      if ('error' in json && json.error) notFound()
      if ('errors' in json && json.errors) notFound()
      return json
    })
  } catch (error) {
    console.error(error) // eslint-disable-line no-console
  }

  if (!order) {
    notFound()
  }

  // Fetch delivery status
  let deliveryStatus = null
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/track-delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        trkType: 'cnno',
        strcnno: order.reference_number,
        addtnlDtl: 'N',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch delivery status')
    }

    const json = await response.json()
    const status = json.trackHeader?.strStatus

    if ('error' in json && json.error) {
      throw new Error('Error in response')
    }
    if ('errors' in json && json.errors) {
      throw new Error('Errors in response')
    }

    deliveryStatus = status
  } catch (error) {}

  return (
    <div>
      <h5>
        {`Order`}
        <span className={classes.id}>{` ${order.id}`}</span>
      </h5>
      <div className={classes.itemMeta}>
        <p>{`ID: ${order.id}`}</p>
        <p>{`Payment Intent: ${order.stripePaymentIntentID}`}</p>
        <p>{`Ordered On: ${formatDateTime(order.createdAt)}`}</p>
        <p className={classes.total}>
          {'Total (after discount): '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'inr',
          }).format((order.total * (100 - order.discount)) / 10000)}
        </p>
        <p>
          {'If your order status is not correct, try: '}
          <Link href={`/order-confirmation?order_id=${order.id}`} className={classes.reconfirmLink}>
            Reconfirm Order
          </Link>
        </p>
      </div>

      <div className={classes.order}>
        {order.items?.map((item, index) => {
          if (typeof item.product === 'object') {
            const {
              quantity,
              size,
              product,
              product: { id, title, meta, stripeProductID },
            } = item

            const metaImage = meta?.image

            return (
              <Fragment key={index}>
                <div className={classes.row}>
                  <Link href={`/products/${product.slug}`} className={classes.mediaWrapper}>
                    {!metaImage && <span className={classes.placeholder}>No image</span>}
                    {metaImage && typeof metaImage !== 'string' && (
                      <Media
                        className={classes.media}
                        imgClassName={classes.image}
                        resource={metaImage}
                        fill
                      />
                    )}
                  </Link>
                  <div className={classes.rowContent}>
                    {!stripeProductID && (
                      <p className={classes.warning}>
                        {'This product is not yet connected to Product ID. To link this product, '}
                        <Link
                          href={`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/collections/products/${id}`}
                        >
                          edit this product in the admin panel
                        </Link>
                        {'.'}
                      </p>
                    )}
                    <h6 className={classes.title}>
                      <Link href={`/products/${product.slug}`} className={classes.titleLink}>
                        {title}
                      </Link>
                    </h6>
                    <p>{`Quantity: ${quantity}`}</p>
                    <p>{`Size: ${size}`}</p>
                    <Price product={product} button={false} quantity={quantity} />
                  </div>
                </div>
              </Fragment>
            )
          }

          return null
        })}
      </div>
      <HR className={classes.hr} />

      {order.stripePaymentIntentID === 'PAID' ||
      order.stripePaymentIntentID === 'Cash On Delivery' ? (
        <>
          {/* Delivery status and reference number */}
          {order.reference_number && (
            <div className={classes.deliverySection}>
              <p className={classes.deliveryStatus}>
                {'Delivery Status: '}
                {deliveryStatus ? deliveryStatus : 'Not available'}
              </p>
              <div className={classes.referenceNumber}>
                <span>{'Consignment Number: '}</span>
                <span>{order.reference_number}</span>
                <CopyToClipboardIcon text={order.reference_number} />
              </div>
              <Link
                href={`https://www.dtdc.in/tracking/shipment-tracking.asp?refNo=${order.reference_number}`}
                target="_blank"
                className={classes.trackingLink}
              >
                Track Your Order
              </Link>
            </div>
          )}

          <p className={classes.deliveryStatus}>{'Your order will be delivered in 7 days'}</p>

          {/* Conditionally render the refund status or the form */}
          <div className={classes.refundSection}>
            {order.refund === 'Failed' ? (
              <div className={classes.refundStatus}>
                <p>{`Refund Status: ${order.refund}`}</p>
                {order.refundMessage && <p>{`Failure reason: ${order.refundMessage}`}</p>}
              </div>
            ) : order.refund === 'refund' ? (
              <UpdateRefundStatusForm orderId={order.id} token={token} />
            ) : (
              <div className={classes.refundStatus}>
                <p>{`Refund Status: ${order.refund}`}</p>
                {order.refundMessage && <p>{`Refund reason: ${order.refundMessage}`}</p>}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

export async function generateMetadata({ params: { id } }): Promise<Metadata> {
  return {
    title: `Order ${id}`,
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
  }
}
