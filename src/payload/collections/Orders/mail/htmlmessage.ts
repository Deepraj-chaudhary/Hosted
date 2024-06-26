import { template } from 'lodash'

import type { Order } from '../../../payload-types'

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

export const generateHtmlMessage = (order: Order): string => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Invoice</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          width: 80%;
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .heading {
          background-color: #e6e6e6;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          font-size: 1.5em;
          font-weight: bold;
        }
        .section {
          padding: 20px;
          border-bottom: 1px solid #e6e6e6;
        }
        .section:last-child {
          border-bottom: none;
        }
        .section-title {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .section-content {
          margin-left: 20px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .table th, .table td {
          padding: 10px;
          border: 1px solid #e6e6e6;
          text-align: left;
        }
        .table th {
          background-color: #e6e6e6;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #e6e6e6;
          border-radius: 0 0 10px 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="heading">Tax Invoice/Bill of Supply/Cash Memo</div>

        <div class="section">
          <div class="section-title">Sold by:</div>
          <div class="section-content">
            <p>MERPH</p>
            <p>G-9/20, SECTOR - 15</p>
            <p>ROHINI, DELHI-110089</p>
            <p>Email: merphpit@gmail.com</p>
            <p>Website: merph.in</p>
            <p>Phone: +91 9971643446</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Invoice Details:</div>
          <div class="section-content">
            <p>Invoice Number / Order ID: <%= order.id %></p>
            <p>Invoice Date: <%= new Date(order.createdAt).toLocaleDateString() %></p>
            <p>PAN No: ABZFM9815B</p>
            <p>GST Registration No: 07ABZFM9815B1ZS</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Billing/Shipping Address:</div>
          <div class="section-content">
            <p>Name: <%= typeof order.orderedBy === 'object' ? order.orderedBy.name : 'N/A' %></p>
            <p>Address: <%= typeof order.orderedBy === 'object' ? order.orderedBy.deliveryaddress : 'N/A' %></p>
            <p>City: <%= typeof order.orderedBy === 'object' ? order.orderedBy.city : 'N/A' %></p>
            <p>State: <%= typeof order.orderedBy === 'object' ? stateMap[order.orderedBy.state] + ' (' + order.orderedBy.state + ')' : 'N/A' %></p>
            <p>Pincode: <%= typeof order.orderedBy === 'object' ? order.orderedBy.pincode : 'N/A' %></p>
            <p>Phone: <%= typeof order.orderedBy === 'object' ? order.orderedBy.contactnumber : 'N/A' %></p>
            <p>Email: <%= typeof order.orderedBy === 'object' ? order.orderedBy.email : 'N/A' %></p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Product Details:</div>
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Quantity</th>
                <th>Size</th>
                <th>Price per Unit</th>
                <th>Discount</th>
                <th>Other Charges</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>IGST</th>
                <th>Total Price per Unit</th>
              </tr>
            </thead>
            <tbody>
              <% order.items.forEach(item => { %>
              <tr>
                <td><%= typeof item.product === 'object' ? item.product.title : 'N/A' %></td>
                <td><%= item.quantity || 'N/A' %></td>
                <td><%= item.size || 'N/A' %></td>
                <td><%= item.price ? (item.price / 100 / 1.05).toFixed(2) : 'N/A' %></td>
                <td>0</td>
                <td>0</td>
                <% const isDelhi = typeof order.orderedBy === 'object' && order.orderedBy.state === 7; %>
                <td><%= isDelhi ? ((item.price / 100 / 1.05) * 0.025).toFixed(2) : '0.00' %></td>
                <td><%= isDelhi ? ((item.price / 100 / 1.05) * 0.025).toFixed(2) : '0.00' %></td>
                <td><%= isDelhi ? '0.00' : ((item.price / 100 / 1.05) * 0.05).toFixed(2) %></td>
                <td><%= item.price ? (item.price/100) : N/A %></td>
              </tr>
              <% }) %>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-content">
            <p>Total: <%= order.total ? (order.total/100) : 'N/A' %></p>
            <p>(Incl. of all taxes)</p>
          </div>
        </div>

        <div class="footer">
          Thank you for shopping with us!
        </div>
      </div>
    </body>
    </html>
  `

  const compiled = template(htmlTemplate)
  const htmlMessage = compiled({ order, stateMap })

  return htmlMessage
}
