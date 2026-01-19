import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import '../css/Pricing.css';

const Pricing = () => {
    const handleCheckout = async (priceId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // Redirect to login or show meaningful error
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priceId })
            });

            const data = await response.json();
            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', data.error);
                alert(`Failed to start checkout session: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert(`An error occurred: ${error.message}`);
        }
    };

    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'Get 3 free analyses a week',
            features: [
                { name: '3 Analyses', included: true },
                { name: 'Track makes and misses', included: true },
                { name: 'Track shot angles', included: false },
                { name: 'Track shot distances', included: false },
                { name: 'Track shot locations', included: false },
                { name: 'Priority Support', included: false },
            ],
            buttonText: 'Get Started',
            buttonLink: '/register', // Free plan just registers
            isFree: true,
            popular: false
        },
        {
            name: 'Standard',
            price: '$9.99',
            description: 'Get 10 free analyses a week',
            features: [
                { name: '10 Analyses', included: true },
                { name: 'Track makes and misses', included: true },
                { name: 'Track session FG%', included: true },
                { name: 'Track FG% Progression', included: false },
                { name: 'Track shot locations', included: false },
                { name: 'Priority Support', included: false },
            ],
            buttonText: 'Get Started',
            priceId: 'price_1Sr78K0lkHUim5wo9C2J6xhp', // Standard Plan Price ID
            popular: true
        },
        {
            name: 'Pro',
            price: '$14.99',
            description: 'Get 25 free analyses a week',
            features: [
                { name: '25 Analyses', included: true },
                { name: 'Track makes and misses', included: true },
                { name: 'Track shot angles', included: true },
                { name: 'Track FG% Progression', included: true },
                { name: 'Track shot locations', included: true },
                { name: 'Priority Support', included: true },
            ],
            buttonText: 'Get Started',
            priceId: 'price_1Sr77w0lkHUim5woxWcXdHbO', // Pro Plan Price ID
            popular: false
        }
    ];

    return (
        <section className="pricing-section">
            <div className="pricing-header">
                <h2>Pricing</h2>
                <p>Select the plan that best suits your needs.</p>
            </div>
            <div className="pricing-grid">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`pricing-card ${plan.popular ? 'pricing-card--popular' : ''}`}
                    >
                        {plan.popular && <span className="popular-badge">Most Popular</span>}

                        <h3 className="pricing-title">{plan.name}</h3>
                        <div className="pricing-price">
                            {plan.price}<span>/month</span>
                        </div>
                        <p className="pricing-desc">{plan.description}</p>

                        <ul className="pricing-features">
                            {plan.features.map((feature, i) => (
                                <li key={i} className={!feature.included ? 'disabled' : ''}>
                                    {feature.included ? (
                                        <Check className="check-icon" />
                                    ) : (
                                        <X className="cross-icon" />
                                    )}
                                    {feature.name}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => plan.isFree ? window.location.href = plan.buttonLink : handleCheckout(plan.priceId)}
                            className={`pricing-btn ${plan.popular ? 'pricing-btn--primary' : 'pricing-btn--outline'}`}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Pricing;
