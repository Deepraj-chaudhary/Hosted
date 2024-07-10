import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { adminsOrLoggedIn } from '../../access/adminsOrLoggedIn'
import { adminsOrOrderedBy } from './access/adminsOrOrderedBy'
import { clearUserCart } from './hooks/clearUserCart'
import { populateOrderedBy } from './hooks/populateOrderedBy'
import { updateUserPurchases } from './hooks/updateUserPurchases'
import { generateOrderPDF } from './mail/pdfGenerator'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['createdAt', 'orderedBy'],
    preview: doc => `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/orders/${doc.id}`,
  },
  hooks: {
    afterChange: [
      updateUserPurchases,
      clearUserCart,
      // New Hook to Send Order Confirmation Email with PDF
      async ({ doc, operation, req }) => {
        if (
          operation === 'update' &&
          (doc?.stripePaymentIntentID === 'PAID' ||
            doc?.stripePaymentIntentID === 'Cash On Delivery') &&
          doc?.refund === 'refund'
        ) {
          const user = doc?.orderedBy
          if (user?.email) {
            // Generate the PDF with order details
            const pdfBuffer = await generateOrderPDF(doc)

            const message = {
              to: user.email,
              from: 'team@merph.in',
              subject: 'Order Confirmation',
              text: `Hi ${user.name}, your order has been placed successfully. Thankyou for shopping with us.`,
              html: `<p>Hi ${user.name}, your order has been placed successfully. Thankyou for shopping with us.</p>`,
              attachments: [
                {
                  filename: `order-${doc.id}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf',
                },
              ],
              bcc: 'merphpit@gmail.com',
            }

            try {
              // Accessing payload instance through req object
              await req.payload.sendEmail(message)
              console.log('Order confirmation email sent successfully') // eslint-disable-line no-console
            } catch (error: unknown) {
              console.error('Error sending order confirmation email:', error) // eslint-disable-line no-console
            }
          }
        }
      },
    ],
  },
  access: {
    read: adminsOrOrderedBy,
    update: adminsOrOrderedBy,
    create: adminsOrLoggedIn,
    delete: admins,
  },
  fields: [
    {
      name: 'orderedBy',
      type: 'relationship',
      relationTo: 'users',
      hooks: {
        beforeChange: [populateOrderedBy],
      },
      access: {
        update: admins,
      },
    },
    {
      name: 'stripePaymentIntentID',
      label: 'Cashfree Payment Intent',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      access: {
        update: admins,
      },
    },
    {
      name: 'discount',
      label: 'Discount (%)',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'reference_number',
      label: 'DTDC Reference Number',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          min: 0,
        },
        {
          name: 'size',
          type: 'text',
          required: true,
        },
      ],
      access: {
        update: admins,
      },
    },
    // New fields with specific access for logged-in users
    {
      name: 'refund',
      type: 'select',
      options: [
        {
          label: 'Refund',
          value: 'refund',
        },
        {
          label: 'Refunded',
          value: 'Refunded',
        },
        {
          label: 'Refunding',
          value: 'Refunding',
        },
        {
          label: 'Refund Failed',
          value: 'Failed',
        },
      ],
      defaultValue: 'refund',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'refundMessage',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
