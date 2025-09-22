import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Calculator, MapPin, Clock } from 'lucide-react';
import Container from '../common/Container';

const features = [
  {
    icon: FileSearch,
    title: 'Invoice Analysis',
    description: 'Upload any quote or invoice and our AI will instantly analyze it for fair pricing.',
  },
  {
    icon: Calculator,
    title: 'Real-Time Estimates',
    description: 'Get accurate cost breakdowns for parts and labor based on your specific vehicle.',
  },
  {
    icon: MapPin,
    title: 'Local Shop Matching',
    description: 'Find trusted mechanics in your area with transparent pricing and verified reviews.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Get help anytime with our AI assistant or connect with our support team.',
  },
];

const FeaturesSection: React.FC = () => {
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to make informed decisions about your car repairs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start">
                <div className="bg-gradient-brand p-3 rounded-lg mr-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturesSection;