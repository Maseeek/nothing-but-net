import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import '../css/Pricing.css';

const Pricing = () => {
    const plans = [
        {
            name: 'Basic',
            price: '$29',
            description: 'Perfect for small businesses and individuals.',
            features: [
                { name: '3 Pages', included: true },
                { name: 'Basic SEO', included: true },
                { name: 'Email Support', included: true },
                { name: 'Responsive Design', included: true },
                { name: 'CMS Integration', included: false },
                { name: '24/7 Chat Support', included: false },
            ],
            buttonText: 'Get Started',
            buttonLink: 'https://buy.stripe.com/test_basic',
            popular: false
        },
        {
            name: 'Standard',
            price: '$59',
            description: 'Best for growing businesses with more needs.',
            features: [
                { name: '10 Pages', included: true },
                { name: 'Advanced SEO', included: true },
                { name: 'CMS Integration', included: true },
                { name: '24/7 Chat Support', included: true },
                { name: 'E-commerce Integration', included: false },
                { name: 'Priority Support', included: false },
            ],
            buttonText: 'Get Started',
            buttonLink: 'https://buy.stripe.com/test_standard',
            popular: true
        },
        {
            name: 'Pro',
            price: '$99',
            description: 'Ideal for larger businesses that need scalability.',
            features: [
                { name: 'Unlimited Pages', included: true },
                { name: 'E-commerce Integration', included: true },
                { name: 'Priority Support', included: true },
                { name: 'Custom API Integration', included: true },
                { name: 'Advanced Analytics', included: true },
                { name: 'Dedicated Manager', included: true },
            ],
            buttonText: 'Contact Sales',
            buttonLink: 'https://buy.stripe.com/test_pro',
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

                        <a
                            href={plan.buttonLink}
                            className={`pricing-btn ${plan.popular ? 'pricing-btn--primary' : 'pricing-btn--outline'}`}
                        >
                            {plan.buttonText}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Pricing;
