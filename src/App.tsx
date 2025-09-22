import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerApp from './pages/CustomerApp';
import ShopRecommendations from './pages/ShopRecommendations';
import BusinessDashboard from './pages/BusinessDashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Customer Application Routes */}
          <Route path="/app" element={<CustomerApp />} />
          <Route path="/shops" element={<ShopRecommendations />} />
          <Route path="/app/login" element={<Login userType="customer" />} />
          <Route path="/app/signup" element={<SignUp userType="customer" />} />

          {/* Business Dashboard Routes */}
          <Route path="/business" element={<BusinessDashboard />} />
          <Route path="/business/login" element={<Login userType="mechanic" />} />
          <Route path="/business/signup" element={<SignUp userType="mechanic" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
