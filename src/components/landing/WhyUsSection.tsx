import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, DollarSign } from 'lucide-react';
import Container from '../common/Container';
import Card from '../common/Card';

const features = [
  {
    icon: Brain,
    title: 'AI-Trained Intelligence',
    description: 'Our AI is trained on thousands of repair manuals and real pricing data to ensure accuracy.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Transparent Pricing',
    description: 'No hidden costs or surprise fees. See exactly what you should be paying for each service.',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: DollarSign,
    title: 'Negotiate Better Deals',
    description: 'Armed with fair pricing data, you can confidently negotiate with any mechanic shop.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
];

const WhyUsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4">
            Why Choose Buckled?
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Stop overpaying for car repairs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're building trust between drivers and mechanics through transparency and data-driven insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hoverable className="h-full">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-brand text-white p-6 -m-6 mb-6">
              <h3 className="text-2xl font-bold">See the Difference</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Service</th>
                    <th className="text-center py-4 px-6 font-medium text-gray-900">Shop Quote</th>
                    <th className="text-center py-4 px-6 font-medium text-gray-900">Buckled Fair Price</th>
                    <th className="text-center py-4 px-6 font-medium text-green-600">You Save</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-6">Oil Change</td>
                    <td className="text-center py-4 px-6 text-red-600">$89.99</td>
                    <td className="text-center py-4 px-6 text-gray-900">$45.00</td>
                    <td className="text-center py-4 px-6 font-semibold text-green-600">$44.99</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6">Brake Pad Replacement</td>
                    <td className="text-center py-4 px-6 text-red-600">$450.00</td>
                    <td className="text-center py-4 px-6 text-gray-900">$250.00</td>
                    <td className="text-center py-4 px-6 font-semibold text-green-600">$200.00</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6">Battery Replacement</td>
                    <td className="text-center py-4 px-6 text-red-600">$299.00</td>
                    <td className="text-center py-4 px-6 text-gray-900">$150.00</td>
                    <td className="text-center py-4 px-6 font-semibold text-green-600">$149.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
};

export default WhyUsSection;