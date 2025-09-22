import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';
import Input from '../common/Input';

const CTASection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Waitlist signup:', { firstName, email });
  };

  return (
    <section className="py-20 bg-gradient-brand relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full" />
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Stop Overpaying?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of drivers who are saving hundreds on car repairs
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Get Early Access
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button type="submit" size="lg">
                  Join Waitlist
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm">Free to join</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm">50% off first analysis</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No spam, ever. We'll only contact you about Buckled updates.
          </p>
        </motion.div>
      </Container>
    </section>
  );
};

export default CTASection;