import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { adminsOrLoggedIn } from '../../access/adminsOrLoggedIn'
import { adminsOrOrderedBy } from './access/adminsOrOrderedBy'
import { clearUserCart } from './hooks/clearUserCart'
import { populateOrderedBy } from './hooks/populateOrderedBy'
import { updateUserPurchases } from './hooks/updateUserPurchases'
import { generateOrderPDF } from './pdfgenerator/pdfGenerator' // Import the PDF generator function
import { LinkToPaymentIntent } from './ui/LinkToPaymentIntent'

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
        if (operation === 'create') {
          const user = doc?.orderedBy
          if (user?.email) {
            // Generate the PDF with order details
            const pdfBuffer = await generateOrderPDF(doc)

            const message = {
              to: user.email,
              from: 'no-reply@yourstore.com',
              subject: 'Order Confirmation',
              text: `Hi ${user.name}, your order has been placed successfully.`,
              html: `<p>Hi ${user.name},</p><p>Your order has been placed successfully. Here are the details:</p>`,
              attachments: [
                {
                  filename: `order-${doc.id}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf',
                },
              ],
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
    update: admins,
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
    },
    {
      name: 'stripePaymentIntentID',
      label: 'Stripe Payment Intent ID',
      type: 'text',
      admin: {
        position: 'sidebar',
        components: {
          Field: LinkToPaymentIntent,
        },
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
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
    },
  ],
}
