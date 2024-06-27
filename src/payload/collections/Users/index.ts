import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { anyone } from '../../access/anyone'
import adminsAndUser from './access/adminsAndUser'
import { checkRole } from './checkRole'
import { customerProxy } from './endpoints/customer'
import { createStripeCustomer } from './hooks/createStripeCustomer'
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { loginAfterCreate } from './hooks/loginAfterCreate'
import { resolveDuplicatePurchases } from './hooks/resolveDuplicatePurchases'
import { sendWelcomeEmail } from './hooks/sendwelcomeemail'
import { CustomerSelect } from './ui/CustomerSelect'

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

const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'contactnumber', 'email', 'deliveryaddress', 'pincode', 'state'],
  },
  access: {
    read: adminsAndUser,
    create: anyone,
    update: adminsAndUser,
    delete: admins,
    admin: ({ req: { user } }) => checkRole(['admin'], user),
  },
  hooks: {
    beforeChange: [createStripeCustomer],
    afterChange: [
      loginAfterCreate,
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          const { name, email } = doc
          try {
            if (email) {
              const message = await sendWelcomeEmail(name, email)

              try {
                // Use the Payload instance to send the email
                await req.payload.sendEmail(message)
                console.log('Welcome email sent successfully') // eslint-disable-line no-console
              } catch (error: unknown) {
                console.error('Error sending welcome email:', error) // eslint-disable-line no-console
              }
            }
          } catch (error: unknown) {
            //do nothing
          }
        }
      },
    ],
  },
  auth: true,
  endpoints: [
    {
      path: '/:teamID/customer',
      method: 'get',
      handler: customerProxy,
    },
    {
      path: '/:teamID/customer',
      method: 'patch',
      handler: customerProxy,
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'contactnumber',
      type: 'text',
    },
    {
      name: 'deliveryaddress',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'state',
      type: 'select',
      options: stateOptions,
    },
    {
      name: 'pincode',
      type: 'number',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['customer'],
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'customer',
          value: 'customer',
        },
      ],
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      access: {
        read: admins,
        create: admins,
        update: admins,
      },
    },
    {
      name: 'purchases',
      label: 'Purchases',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      hooks: {
        beforeChange: [resolveDuplicatePurchases],
      },
    },
    {
      name: 'stripeCustomerID',
      label: 'Stripe Customer',
      type: 'text',
      access: {
        read: ({ req: { user } }) => checkRole(['admin'], user),
      },
      admin: {
        position: 'sidebar',
        components: {
          Field: CustomerSelect,
        },
      },
    },
    {
      label: 'Cart',
      name: 'cart',
      type: 'group',
      fields: [
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          interfaceName: 'CartItems',
          fields: [
            {
              name: 'product',
              type: 'relationship',
              relationTo: 'products',
            },
            {
              name: 'quantity',
              type: 'number',
              min: 0,
              admin: {
                step: 1,
              },
            },
            {
              name: 'size',
              type: 'text',
            },
          ],
        },
        // If you wanted to maintain a 'created on'
        // or 'last modified' date for the cart
        // you could do so here:
        // {
        //   name: 'createdOn',
        //   label: 'Created On',
        //   type: 'date',
        //   admin: {
        //     readOnly: true
        //   }
        // },
        // {
        //   name: 'lastModified',
        //   label: 'Last Modified',
        //   type: 'date',
        //   admin: {
        //     readOnly: true
        //   }
        // },
      ],
    },
    {
      name: 'skipSync',
      label: 'Skip Sync',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        readOnly: true,
        hidden: true,
      },
    },
  ],
  timestamps: true,
}

export default Users
