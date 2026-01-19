import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listProducts() {
    try {
        const products = await stripe.products.list({ limit: 10 });
        if (products.data.length === 0) {
            console.log("No products found in this Stripe account.");
        } else {
            console.log('Existing Products:');
            products.data.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
        }
    } catch (err) {
        console.error("Error listing products:", err.message);
    }
}

listProducts();
