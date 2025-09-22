import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Users, Award } from 'lucide-react';
import Container from '../common/Container';
import Card from '../common/Card';

const FounderSection: React.FC = () => {
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
          <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
            Founded by Women, For Women
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Empowering Women in Automotive
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Founder Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-gradient-brand text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Girl Power
                </div>
              </div>

              {/* Placeholder for founder image */}
              <div className="bg-gradient-soft h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-16 h-16 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">CEO & Founder</h3>
                  <p className="text-gray-600">Empowering Knowledge</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Column - About Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Our Mission: Transparent Pricing for Everyone
            </h3>

            <p className="text-lg text-gray-600 mb-6">
              Buckled was born from a simple frustration: the lack of transparency in automotive pricing.
              As a woman navigating the male-dominated automotive industry, our founder experienced firsthand
              the challenges of getting fair, honest quotes for car repairs.
            </p>

            <p className="text-lg text-gray-600 mb-6">
              That's why we built Buckled - to empower drivers, especially women, with the knowledge and
              tools they need to ensure they're never overcharged again. Our AI-powered platform analyzes
              thousands of data points to provide you with fair, accurate pricing for any repair.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <div className="bg-pink-50 p-3 rounded-lg mr-4">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Women-First Design</h4>
                  <p className="text-sm text-gray-600">Built with women's needs in mind</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-50 p-3 rounded-lg mr-4">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Award-Winning</h4>
                  <p className="text-sm text-gray-600">Recognized for innovation</p>
                </div>
              </div>
            </div>

            <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-700">
              "Every driver deserves transparency and fairness. We're not just building a platform;
              we're building trust between drivers and mechanics."
              <footer className="text-sm text-gray-600 mt-2">— Founder & CEO</footer>
            </blockquote>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default FounderSection;