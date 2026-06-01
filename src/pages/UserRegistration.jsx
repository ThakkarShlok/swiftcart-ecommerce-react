import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const UserRegistration = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (!name || !email || !password || !mobile) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('user_name', name);
      dataPayload.append('user_email', email);
      dataPayload.append('user_password', password);
      dataPayload.append('user_mobile', mobile);

      const res = await axios.post(getApiUrl('api-user-register.php'), dataPayload, {
        headers: authHeaders(API_TOKEN),
      });

      if (String(res.data.flag) === '1' || res.data.flag == 1) {
        alert(res.data.message || 'Account created successfully.');
        if (onRegisterSuccess) onRegisterSuccess();
        else navigate('/login');
      } else {
        alert(res.data.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Something went wrong. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-sapphire-50 via-white to-copper-50">
      <div className="container-custom py-16">
      <div className="card-surface mx-auto max-w-md border-white/70 p-8 shadow-soft">
        <div className="mb-6 text-center">
          <p className="eyebrow">Create account</p>
          <h1 className="mt-3 text-3xl font-black text-ink-950">Welcome to SwiftCart</h1>
          <p className="mt-2 text-sm text-ink-500">Start shopping faster with your account.</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <label className="block text-sm font-bold text-ink-700">
            Full name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" className="field mt-2" required />
          </label>

          <label className="block text-sm font-bold text-ink-700">
            Mobile number
            <div className="mt-2 flex gap-3">
              <span className="inline-flex items-center rounded-2xl border border-ink-100 bg-surface-100 px-4 text-sm font-bold text-ink-600">+91</span>
              <input type="tel" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" className="field" required />
            </div>
          </label>

          <label className="block text-sm font-bold text-ink-700">
            Email address
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field mt-2" required />
          </label>

          <label className="block text-sm font-bold text-ink-700">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="field mt-2" required />
          </label>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? 'Creating account...' : 'Get started'}
          </Button>
        </form>

        <div className="mt-6 border-t border-ink-100 pt-6 text-center text-sm text-ink-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-ink-950 hover:text-copper-700">Sign in</Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserRegistration;
