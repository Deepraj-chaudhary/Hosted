import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Cashfree } from 'cashfree-pg';
import dotenv from 'dotenv'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

function generateOrderId(): string {
    const uniqueId = crypto.randomBytes(16).toString('hex');

    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);

    const orderId = hash.digest('hex');

    return orderId.substr(0,12);
}

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
})

app.get('/payment', async (req: Request, res: Response) => {
    try {
        let request = {
            "order_amount": 1.00,
            "order_currency": "INR",
            "order_id": await generateOrderId(),
            "customer_details": {
                "customer_id": "webcodder01",
                "customer_phone": "9999999999",
                "customer_name": "Web Codder",
                "customer_email": "webcodder@example.com"
            },
        }

        Cashfree.PGCreateOrder("2023-08-01",request).then(response => {
            console.log(response.data);
            res.json(response.data);

        }).catch(error => {
            console.error(error.response.data.message);
        })
    } catch (error) {
        console.log(error);
    }
})

app.post('/verify', async (req: Request, res: Response) => {
    try {
        let { orderId } = req.body;
        
        Cashfree.PGOrderFetchPayments("2023-08-01",orderId).then((response) => {
            res.json(response.data);
        }).catch(error => {
            console.error(error.response.data.message);
        })
    } catch (error) {
        console.log(error);
    }
})

app.listen(8000, () => {
    console.log('Server is running on port 8000');
})