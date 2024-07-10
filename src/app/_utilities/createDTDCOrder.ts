import type { Order, User } from '../../payload/payload-types'
import { stateOptions } from '../constants'

export const createDTDCOrder = async (order: Order, user: User): Promise<string> => {
  const stateLabel = stateOptions.find(option => option.value === user.state)?.label
  const totalProducts = order.items.reduce((total, item) => total + item.quantity, 0)
  try {
    const consignment: any = {
      customer_code: 'NL4880',
      service_type_id: 'B2C SMART EXPRESS',
      load_type: 'NON-DOCUMENT',
      description: 'STITCHED GARMENT',
      dimension_unit: 'cm',
      length: '36',
      width: '32',
      height: (3 * totalProducts).toString(),
      weight_unit: 'kg',
      weight: (0.3 * totalProducts).toString(),
      declared_value: (order.total / 100).toString(),
      customer_reference_number: order.id,
      commodity_id: '2',
      consignment_type: 'Forward',
      invoice_number: order.id,
      origin_details: {
        name: 'Merph',
        phone: '9971643446',
        address_line_1: 'A-3/81 sector-16 Rohini',
        pincode: '110089',
        city: 'New Delhi',
        state: 'Delhi',
      },
      destination_details: {
        name: user.name,
        phone: user.contactnumber.toString(),
        address_line_1: user.deliveryaddress,
        pincode: user.pincode.toString(),
        city: user.city,
        state: stateLabel,
      },
    }

    if (order.stripePaymentIntentID === 'Cash On Delivery') {
      consignment.cod_amount = (order.total / 100).toString()
      consignment.cod_collection_mode = 'cash'
    }

    const response = await fetch('/api/create-dtdc-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consignments: [consignment],
      }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0].reference_number
  } catch (error: unknown) {
    throw error
  }
}
