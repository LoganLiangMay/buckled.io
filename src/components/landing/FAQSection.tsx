import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Container from '../common/Container';

const faqs = [
  {
    question: 'How does Buckled determine fair pricing?',
    answer: 'Our AI analyzes thousands of repair manuals, parts databases, and regional labor rates to calculate fair pricing. We consider your specific vehicle make, model, and year, along with current market prices for parts and standard labor times for each repair.',
  },
  {
    question: 'Is Buckled free to use?',
    answer: 'We offer a free tier that includes basic price checking and estimates. Premium features like detailed invoice analysis, negotiation tips, and unlimited quotes are available with our subscription plans starting at $9.99/month.',
  },
  {
    question: 'How accurate are the price estimates?',
    answer: 'Our estimates are 98% accurate within a $50 margin for most common repairs. We continuously update our database with real-world pricing data to ensure accuracy. Remember, prices can vary based on your location and vehicle condition.',
  },
  {
    question: 'Can mechanics join Buckled?',
    answer: 'Absolutely! We welcome honest, transparent mechanics to join our platform. Shops can create profiles, showcase their services, and connect with customers looking for fair pricing. Visit our "For Mechanics" page to learn more.',
  },
  {
    question: 'What types of repairs does Buckled cover?',
    answer: 'We cover all common automotive repairs and maintenance services, from oil changes to engine rebuilds. Our database includes over 10,000 different repair procedures across all major vehicle makes and models.',
  },
  {
    question: 'How do I upload an invoice for analysis?',
    answer: 'Simply take a photo or scan your invoice, then upload it through our app or website. Our AI uses Google Vision technology to read and analyze the document, providing you with a detailed breakdown within seconds.',
  },
];

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full text-left flex justify-between items-center py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 pt-3 pb-2">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about Buckled
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
};

export default FAQSection;