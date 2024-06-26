// server.ts

import dotenv from 'dotenv'
import express from 'express'
import next from 'next'
import nextBuild from 'next/dist/build'
import path from 'path'
import payload from 'payload'

import { createOrder, getOrder } from './cashfreeIntegration'
import { seed } from './payload/seed'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const app = express()
const PORT = process.env.PORT || 3000

// Middleware to parse JSON
app.use(express.json())

// Middleware to parse raw body for webhook validation
// app.use((req, res, next) => {
//   if (req.originalUrl === '/api/webhook') {
//     req.rawBody = '';
//     req.setEncoding('utf8');
//     req.on('data', (chunk) => {
//       req.rawBody += chunk;
//     });
//     req.on('end', () => {
//       next();
//     });
//   } else {
//     next();
//   }
// });

const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || '',
    express: app,
    onInit: () => {
      payload.logger.info(`Admin URL: ${payload.getAdminURL()}`)
    },
    email: {
      transportOptions: {
        service: 'gmail',
        host: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        requireTLS: true,
      },
      fromName: 'Merph.in',
      fromAddress: 'no-reply@merph.in',
    },
  })

  if (process.env.PAYLOAD_SEED === 'true') {
    await seed(payload)
    process.exit()
  }

  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info(`Next.js is now building...`)
      // @ts-expect-error
      await nextBuild(path.join(__dirname, '../'))
      process.exit()
    })

    return
  }

  const nextApp = next({
    dev: process.env.NODE_ENV !== 'production',
  })

  const nextHandler = nextApp.getRequestHandler()

  // Endpoint to create order
  app.post('/api/create-order', async (req, res) => {
    try {
      const order = await createOrder(req.body)
      res.status(200).json(order)
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message })
      }
    }
  })

  // Endpoint to get order details
  app.get('/api/get-order/:orderId', async (req, res) => {
    try {
      const order = await getOrder(req.params.orderId)
      res.status(200).json(order)
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message })
      }
    }
  })

  // Webhook endpoint
  // app.post('/api/webhook', (req, res) => {
  //   if (validateWebhook(req)) {
  //     res.status(200).send('Webhook verified')
  //   } else {
  //     res.status(400).send('Invalid webhook')
  //   }
  // })

  nextApp.prepare().then(() => {
    payload.logger.info('Starting Next.js...')

    app.listen(PORT, async () => {
      payload.logger.info(`Next.js App URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}`)
    })

    app.use((req, res) => nextHandler(req, res))
  })
}

start()
