import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import Button from './Button';
import Container from './Container';
import logoImage from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
      <Container>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={logoImage} alt="Buckled Logo" className="w-8 h-8" />
            </div>
            <span className="text-xl font-bold gradient-text">buckled</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2">
                  <Link
                    to="/app"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  >
                    Get a Quote
                  </Link>
                  <Link
                    to="/business"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  >
                    For Mechanics
                  </Link>
                </div>
              )}
            </div>

            <Link to="/about" className="text-gray-700 hover:text-primary-500 transition">
              About
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-primary-500 transition">
              Pricing
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-500 transition">
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLanding ? (
              <>
                <Link to="/app/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/app/signup">
                  <Button variant="primary" size="sm">Join Waitlist</Button>
                </Link>
              </>
            ) : (
              <Link to="/app">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/app"
                className="text-gray-700 hover:text-primary-500 transition"
                onClick={() => setIsOpen(false)}
              >
                Get a Quote
              </Link>
              <Link
                to="/business"
                className="text-gray-700 hover:text-primary-500 transition"
                onClick={() => setIsOpen(false)}
              >
                For Mechanics
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-primary-500 transition"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-primary-500 transition"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-primary-500 transition"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t flex flex-col space-y-2">
                <Link to="/app/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>Login</Button>
                </Link>
                <Link to="/app/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>Join Waitlist</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
};

export default Navbar;