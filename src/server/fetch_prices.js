import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to read from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const productIds = ['prod_TokdW0kwkeMU0K', 'prod_Tokdin3IEFVZps'];

console.log('Using Stripe Key:', process.env.STRIPE_SECRET_KEY ? '***' + process.env.STRIPE_SECRET_KEY.slice(-4) : 'MISSING');

async function getPrices() {
    for (const prodId of productIds) {
        try {
            const prices = await stripe.prices.list({
                product: prodId,
                active: true,
                limit: 1,
            });
            if (prices.data.length > 0) {
                console.log(`Product ${prodId}: Price ID = ${prices.data[0].id}, Amount = ${prices.data[0].unit_amount} ${prices.data[0].currency}`);
            } else {
                console.log(`Product ${prodId}: No active prices found.`);
            }
        } catch (error) {
            console.error(`Error fetching price for ${prodId}:`, error.message);
        }
    }
}

getPrices();
