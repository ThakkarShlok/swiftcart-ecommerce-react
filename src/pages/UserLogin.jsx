// src/UserLogin.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const UserLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const LOGIN_URL = getApiUrl('api-login.php');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const loginData = new FormData();
      loginData.append('user_email', email);
      loginData.append('user_password', password);

      const res = await axios.post(LOGIN_URL, loginData, {
        headers: authHeaders(API_TOKEN),
      });

      if (String(res.data.flag) === '1') {
        const userId = res.data.user_id || res.data.user_details?.user_id;
        const userName = res.data.user_name || res.data.user_details?.user_name || 'Customer';

        if (!userId) {
          alert('Server failed to deliver a valid user identifier.');
          return;
        }

        localStorage.setItem('stored_user_id', String(userId));
        localStorage.setItem('stored_user_name', userName);
        localStorage.setItem('stored_user_email', email || '');
        alert(res.data.message || 'Logged in successfully.');

        onLoginSuccess({ user_id: userId, user_name: userName, user_email: email || '' });
        navigate('/');
      } else {
        alert(res.data.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Network error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-sapphire-50 via-white to-copper-50">
      <div className="container-custom py-16">
      <div className="card-surface mx-auto max-w-md border-white/70 p-8 shadow-soft">
        <div className="mb-6 text-center">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-3 text-3xl font-black text-ink-950">Sign in to SwiftCart</h1>
          <p className="mt-2 text-sm text-ink-500">Access your cart, wishlist, and orders.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <label className="block text-sm font-bold text-ink-700">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field mt-2"
              required
            />
          </label>

          <label className="block text-sm font-bold text-ink-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-2"
              required
            />
          </label>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? 'Verifying...' : 'Continue'}
          </Button>
        </form>

        <div className="mt-6 border-t border-ink-100 pt-6 text-center text-sm text-ink-500">
          <p className="mb-3">Prefer a secure login code instead?</p>
          <Link
            to="/login-otp"
            className="btn-secondary w-full justify-center"
          >
            Login with OTP
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserLogin;
