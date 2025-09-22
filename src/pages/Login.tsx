import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Container from '../components/common/Container';
import logoImage from '../assets/logo.png';

interface LoginProps {
  userType: 'customer' | 'mechanic';
}

const Login: React.FC<LoginProps> = ({ userType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password, userType });
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
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Log in to your {userType === 'customer' ? 'account' : 'business dashboard'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email Address"
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" fullWidth size="lg">
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to={userType === 'customer' ? '/app/signup' : '/business/signup'}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign up
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

export default Login;