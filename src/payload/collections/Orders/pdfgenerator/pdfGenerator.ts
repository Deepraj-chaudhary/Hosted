import type { RGB } from 'pdf-lib'
import { PageSizes, PDFDocument, rgb, StandardFonts } from 'pdf-lib'

import type { Order, Product } from '../../../payload-types'

export const generateOrderPDF = async (order: Order): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create()
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const firstPage = pdfDoc.addPage(PageSizes.A4)
  const { width: pageWidth, height: pageHeight } = firstPage.getSize()

  const fontSize = 12
  const margin = 50
  let yOffset = pageHeight - margin

  const drawBackground = (
    x: number,
    y: number,
    width: number,
    height: number,
    color: RGB,
  ): void => {
    firstPage.drawRectangle({
      x,
      y,
      width,
      height,
      color,
      opacity: 0.1,
    })
  }

  // Heading with background
  drawBackground(margin, yOffset - 30, pageWidth - 2 * margin, 30, rgb(0.9, 0.9, 0.9))
  firstPage.drawText('Tax Invoice/Bill of Supply/Cash Memo', {
    x: margin,
    y: yOffset,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  // Seller Information with background
  yOffset -= 40
  drawBackground(pageWidth - margin - 180, yOffset - 90, 180, 90, rgb(0.8, 0.8, 0.8))
  firstPage.drawText('Sold by:', {
    x: pageWidth - margin - 150,
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yOffset -= 20
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
      x: pageWidth - margin - 150,
      y: yOffset - index * 15,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  })

  // Invoice Details on the left with background
  yOffset -= 20
  drawBackground(margin, yOffset - 60, 250, 60, rgb(0.9, 0.9, 0.9))
  const invoiceDetails = [
    `Invoice Number / Order ID: ${order.id || 'N/A'}`,
    `Invoice Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`,
    `GST Registration No: ${'N/A'}`,
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

  // Billing Address with background
  yOffset -= 70
  drawBackground(margin, yOffset - 90, pageWidth - 2 * margin, 90, rgb(0.8, 0.8, 0.8))
  firstPage.drawText('Billing Address:', {
    x: margin,
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yOffset -= 20
  const billingAddress = [
    `Name: ${(typeof order.orderedBy === 'object' && order.orderedBy.name) || 'N/A'}`,
    `Address: ${'N/A'}`,
    `Phone: ${'N/A'}`,
    `Email: ${(typeof order.orderedBy === 'object' && order.orderedBy.email) || 'N/A'}`,
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

  // Product Details Table with background
  yOffset -= 100
  drawBackground(margin, yOffset - 20, pageWidth - 2 * margin, 20, rgb(0.9, 0.9, 0.9))
  firstPage.drawText('Product Details:', {
    x: margin,
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yOffset -= 20
  const tableHeaders = ['Item Description', 'Quantity', 'Size', 'Price']
  const columnXPositions = [margin, 250, 320, 400]

  drawBackground(margin, yOffset - 20, pageWidth - 2 * margin, 20, rgb(0.8, 0.8, 0.8))
  tableHeaders.forEach((header, index) => {
    firstPage.drawText(header, {
      x: columnXPositions[index],
      y: yOffset,
      size: fontSize,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    })
  })

  yOffset -= 20
  order.items.forEach(
    (
      item: {
        product: string | Product
        price?: number
        quantity?: number
        size: string
        id?: string
      },
      index: number,
    ) => {
      drawBackground(
        margin,
        yOffset - 20,
        pageWidth - 2 * margin,
        20,
        index % 2 === 0 ? rgb(0.95, 0.95, 0.95) : rgb(0.9, 0.9, 0.9),
      )

      const title = (typeof item.product === 'object' && item.product.title) || 'N/A'
      let startIndex = 0
      while (startIndex < title.length) {
        const part = title.substr(startIndex, 30)
        firstPage.drawText(part, {
          x: columnXPositions[0],
          y: yOffset - (startIndex / 30) * 10, // Adjust the y position based on the part index
          size: fontSize - 4,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        })
        startIndex += 30
      }

      firstPage.drawText(item.quantity ? item.quantity.toString() : 'N/A', {
        x: columnXPositions[1],
        y: yOffset,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
      firstPage.drawText(item.size || 'N/A', {
        x: columnXPositions[2],
        y: yOffset,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
      firstPage.drawText(item.price ? (item.price / 100).toFixed(2) : 'N/A', {
        x: columnXPositions[3],
        y: yOffset,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
      yOffset -= 20
    },
  )

  // Total with background
  yOffset -= 20
  drawBackground(columnXPositions[3] - 10, yOffset - 20, 90, 40, rgb(0.9, 0.9, 0.9))
  firstPage.drawText(`Total: ${order.total ? (order.total / 100).toFixed(2) : 'N/A'}`, {
    x: columnXPositions[3],
    y: yOffset,
    size: fontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  // Include tax message below the total
  yOffset -= 20
  firstPage.drawText('(Incl. of all taxes)', {
    x: columnXPositions[3],
    y: yOffset,
    size: fontSize - 2,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })

  // Thank You message with background
  yOffset -= 60
  drawBackground(margin, yOffset - 10, pageWidth - 2 * margin, 20, rgb(0.9, 0.9, 0.9))
  firstPage.drawText('Thank you for shopping with us!', {
    x: margin,
    y: yOffset,
    size: fontSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })

  // Save the PDF
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
