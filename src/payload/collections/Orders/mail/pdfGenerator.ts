// import type { RGB } from 'pdf-lib';
import { PageSizes, PDFDocument, rgb, StandardFonts } from 'pdf-lib'

import type { Order } from '../../../payload-types'

export const generateOrderPDF = async (order: Order): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create()
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const firstPage = pdfDoc.addPage(PageSizes.A4)
  const { width: pageWidth, height: pageHeight } = firstPage.getSize()
  const stateMap = {
    1: 'JAMMU AND KASHMIR',
    2: 'HIMACHAL PRADESH',
    3: 'PUNJAB',
    4: 'CHANDIGARH',
    5: 'UTTARAKHAND',
    6: 'HARYANA',
    7: 'DELHI',
    8: 'RAJASTHAN',
    9: 'UTTAR PRADESH',
    10: 'BIHAR',
    11: 'SIKKIM',
    12: 'ARUNACHAL PRADESH',
    13: 'NAGALAND',
    14: 'MANIPUR',
    15: 'MIZORAM',
    16: 'TRIPURA',
    17: 'MEGHALAYA',
    18: 'ASSAM',
    19: 'WEST BENGAL',
    20: 'JHARKHAND',
    21: 'ORISSA',
    22: 'CHHATTISGARH',
    23: 'MADHYA PRADESH',
    24: 'GUJARAT',
    26: 'DADAR AND NAGAR HAVELI & DAMAN AND DIU',
    27: 'MAHARASHTRA',
    29: 'KARNATAKA',
    30: 'GOA',
    31: 'LAKSHADWEEP',
    32: 'KERALA',
    33: 'TAMIL NADU',
    34: 'PUDUCHERRY',
    35: 'ANDAMAN AND NICOBAR',
    36: 'TELANGANA',
    37: 'ANDHRA PRADESH',
    38: 'LADAKH',
    97: 'OTHER TERRITORY',
    99: 'OTHER COUNTRY',
  }

  const fontSize = 10
  const margin = 30
  let yOffset = pageHeight - margin

  // Function to draw a horizontal line
  const drawHorizontalLine = (y: number): void => {
    firstPage.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    })
  }

  // Heading
  yOffset -= 30
  firstPage.drawText('Merph.in         Tax Invoice/Bill of Supply/Cash Memo', {
    x: margin,
    y: yOffset,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  // Draw line after heading
  yOffset -= 10
  drawHorizontalLine(yOffset)

  // Seller Information
  yOffset -= 30
  firstPage.drawText('Sold by:', {
    x: margin,
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yOffset -= 15
  const sellerInfo = [
    'MERPH',
    'G-9/20, SECTOR - 15',
    'ROHINI, DELHI-110089',
    'merphpit@gmail.com',
    'merph.in',
    '+91 9971643446',
  ]
  sellerInfo.forEach((line, index) => {
    firstPage.drawText(line, {
      x: margin,
      y: yOffset - index * 15,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  })

  // Invoice Details
  yOffset -= sellerInfo.length * 15 + 20
  firstPage.drawText('Invoice Details:', {
    x: margin,
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yOffset -= 15
  const invoiceDetails = [
    `Invoice Number / Order ID: ${order.id || 'N/A'}`,
    `Invoice Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`,
    `PAN No: ABZFM9815B`,
    `GST Registration No: 07ABZFM9815B1ZS`,
  ]
  invoiceDetails.forEach((line, index) => {
    firstPage.drawText(line, {
      x: margin,
      y: yOffset - index * 15,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  })

  // Draw line after invoice details
  yOffset -= invoiceDetails.length * 15 + 10
  drawHorizontalLine(yOffset)

  // Billing/Shipping Address
  yOffset -= 20
  firstPage.drawText('Billing/Shipping Address:', {
    x: margin,
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yOffset -= 15
  const billingAddress = [
    `Name: ${typeof order.orderedBy === 'object' ? order.orderedBy.name : 'N/A'}`,
    `Address: ${typeof order.orderedBy === 'object' ? order.orderedBy.deliveryaddress : 'N/A'}`,
    `City: ${typeof order.orderedBy === 'object' ? order.orderedBy.city : 'N/A'}`,
    `State: ${
      typeof order.orderedBy === 'object'
        ? stateMap[order.orderedBy.state] + ' (' + order.orderedBy.state + ')'
        : 'N/A'
    }`,
    `Pincode: ${typeof order.orderedBy === 'object' ? order.orderedBy.pincode : 'N/A'}`,
    `Phone: ${typeof order.orderedBy === 'object' ? order.orderedBy.contactnumber : 'N/A'}`,
    `Email: ${typeof order.orderedBy === 'object' ? order.orderedBy.email : 'N/A'}`,
  ]
  billingAddress.forEach((line, index) => {
    firstPage.drawText(line, {
      x: margin,
      y: yOffset - index * 15,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  })

  // Draw line after billing/shipping address
  yOffset -= billingAddress.length * 15 + 10
  drawHorizontalLine(yOffset)
  // Product Details
  yOffset -= 20
  firstPage.drawText('Product Details:', {
    x: margin,
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yOffset -= 15
  const tableHeaders = [
    'Item Description',
    'QN',
    'Size',
    'Price/unit',
    'Discount',
    'CGST',
    'SGST',
    'IGST',
    'Total/unit',
  ]
  const columnXPositions = [margin, 150, 180, 210, 270, 330, 390, 460, 510]

  // Draw table headers
  tableHeaders.forEach((header, index) => {
    firstPage.drawText(header, {
      x: columnXPositions[index],
      y: yOffset,
      size: fontSize,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    })
  })

  // Draw line after headers
  yOffset -= 10
  drawHorizontalLine(yOffset)

  yOffset -= 15
  order.items.forEach((item, itemIndex) => {
    const isDelhi = typeof order.orderedBy === 'object' && order.orderedBy.state === '7'
    const discountPercentage = order.discount ? order.discount : 0
    const discountFactor = 1 - discountPercentage / 100
    const discountedPrice = item.price ? item.price * discountFactor : 0
    const pricePerUnit = item.price ? (item.price / 100 / 1.05).toFixed(2) : 'N/A'
    const cgst = isDelhi ? ((discountedPrice / 100 / 1.05) * 0.025).toFixed(2) + ' @2.5%' : '0.00'
    const sgst = isDelhi ? ((discountedPrice / 100 / 1.05) * 0.025).toFixed(2) + ' @2.5%' : '0.00'
    const igst = !isDelhi ? ((discountedPrice / 100 / 1.05) * 0.05).toFixed(2) + ' @5%' : '0.00'
    const totalPricePerUnit = discountedPrice ? (discountedPrice / 100).toFixed(2) : 'N/A'

    // Adjusted font size for product title
    const productFontSize = fontSize - 2
    const productTitle = typeof item.product === 'object' ? item.product.title : 'N/A'

    // Function to break text into two lines if too long
    const splitText = (text: string, maxLength: number): string[] => {
      const words = text.split(' ')
      let line1 = ''
      let line2 = ''
      for (const word of words) {
        if ((line1 + word).length <= maxLength) {
          line1 += (line1 ? ' ' : '') + word
        } else {
          line2 += (line2 ? ' ' : '') + word
        }
      }
      return [line1, line2]
    }

    // Breaking the product title into two lines if it's too long
    const [line1, line2] = splitText(productTitle, 30) // Adjust the number based on font size and column width

    // Adjust yOffset for the second line if needed
    let currentYOffset = yOffset - itemIndex * 20

    // Draw the first line of the product title
    firstPage.drawText(line1, {
      x: columnXPositions[0],
      y: currentYOffset,
      size: productFontSize - 2,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })

    // If there's a second line, draw it below the first line and adjust currentYOffset
    if (line2) {
      currentYOffset -= 8 // Adjust this value as needed for spacing between lines
      firstPage.drawText(line2, {
        x: columnXPositions[0],
        y: currentYOffset,
        size: productFontSize - 2,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    }

    // Adjust yOffset for the remaining details
    currentYOffset -= 10

    // Draw the remaining details
    const details = [
      `${item.quantity ?? 'N/A'}`,
      `${item.size ? item.size : 'N/A'}`,
      `${pricePerUnit}`,
      `${discountPercentage.toFixed(2)}%`,
      `${cgst}`,
      `${sgst}`,
      `${igst}`,
      `${totalPricePerUnit}`,
    ]

    details.forEach((detail, detailIndex) => {
      firstPage.drawText(detail, {
        x: columnXPositions[detailIndex + 1],
        y: yOffset - itemIndex * 20 - (line2 ? 8 : 0), // Adjust for two-line title if present
        size: productFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    })

    // Adjust yOffset for the next item, considering extra space if there were two lines
  })
  yOffset -= order.items.length * 20

  // Draw line after product details
  drawHorizontalLine(yOffset)

  // Total Price
  yOffset -= 20
  firstPage.drawText('Total Price:', {
    x: columnXPositions[0], // Just before Total Price per Unit column
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  const totalPrice = order.total
    ? ((order.total / 100) * (1 - order.discount / 100)).toFixed(2) + ' INR'
    : 'N/A'
  firstPage.drawText(totalPrice, {
    x: columnXPositions[8],
    y: yOffset,
    size: fontSize - 2,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  // Payment Mode
  yOffset -= 20
  firstPage.drawText('Payment Mode:', {
    x: columnXPositions[0], // Just before Total Price per Unit column
    y: yOffset,
    size: fontSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })

  const paymentMode = order.stripePaymentIntentID ? order.stripePaymentIntentID : 'N/A'
  firstPage.drawText(paymentMode, {
    x: columnXPositions[1],
    y: yOffset,
    size: fontSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })

  // Draw line after payment mode
  yOffset -= 10
  drawHorizontalLine(yOffset)

  // Footer
  yOffset -= 20
  firstPage.drawText(
    'For any questions, please contact us at +91 9971643446 or merphpit@gmail.com',
    {
      x: margin,
      y: yOffset,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    },
  )

  // Draw line after footer
  yOffset -= 10
  drawHorizontalLine(yOffset)

  // Final notes
  yOffset -= 20
  const footerNotes = [
    'This is a computer generated document and does not require a physical signature.',
    'Thank you for your purchase!',
  ]
  footerNotes.forEach((note, index) => {
    firstPage.drawText(note, {
      x: margin,
      y: yOffset - index * 15,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  })

  // Save the PDF document and return the byte array
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
