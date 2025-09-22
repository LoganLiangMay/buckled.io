import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Container from '../components/common/Container';
import logoImage from '../assets/logo.png';

interface SignUpProps {
  userType: 'customer' | 'mechanic';
}

const SignUp: React.FC<SignUpProps> = ({ userType }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up:', { ...formData, userType });
    // Navigate to appropriate dashboard
    navigate(userType === 'customer' ? '/app' : '/business');
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center py-12 px-4">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src={logoImage} alt="Buckled Logo" className="w-12 h-12" />
                </div>
              </Link>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                {userType === 'customer'
                  ? 'Join thousands saving on car repairs'
                  : 'Register your mechanic shop'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  label="First Name"
                  icon={<User className="w-5 h-5 text-gray-400" />}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Email Address"
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                icon={<Phone className="w-5 h-5 text-gray-400" />}
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
              />

              <Input
                type="password"
                name="password"
                label="Password"
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  required
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button type="submit" fullWidth size="lg">
                Create Account
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to={userType === 'customer' ? '/app/login' : '/business/login'}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Back Link */}
            <Link
              to="/"
              className="mt-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SignUp;