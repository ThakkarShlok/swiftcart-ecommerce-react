// src/pages/LoginWithOtp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const LoginWithOtp = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const SEND_OTP_URL = getApiUrl('api-otp-login.php');

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const cleanedMobile = mobileNumber.trim();
    if (!cleanedMobile || cleanedMobile.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_mobile', cleanedMobile);

      const res = await axios.post(SEND_OTP_URL, payload, {
        headers: authHeaders(API_TOKEN)
      });

      if (String(res.data.flag) === "1") {
        const receivedOtp = res.data.mobile_otp || res.data.otp || "";
        
        alert(res.data.message || "OTP sent successfully!");
        
        navigate('/verify-otp', { 
          state: { 
            mobileNumber: cleanedMobile,
            incomingOtp: receivedOtp
          } 
        });
      } else {
        alert(res.data.message || "This mobile number is not registered.");
      }
    } catch (err) {
      console.error("OTP request transmission error:", err);
      alert("Unable to send verification code. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-50 via-white to-copper-50 py-16">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-copper-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-ink-950">SwiftCart</span>
            </Link>
            <div className="inline-flex items-center gap-2 bg-copper-50 rounded-full px-4 py-1.5 text-sm font-medium text-copper-700 mb-4">
              <span className="w-2 h-2 bg-copper-500 rounded-full animate-pulse" />
              Secure login
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-ink-950 mb-3">
              Login with OTP
            </h1>
            <p className="text-ink-600">
              We'll send a verification code to your mobile number
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Mobile Number Input */}
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">
                  Mobile number
                </label>
                <div className="flex gap-3">
                  <span className="inline-flex items-center px-4 rounded-xl border border-gray-200 bg-gray-50 text-ink-700 font-medium text-sm">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    maxLength="10"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="field flex-1"
                    required
                  />
                </div>
                <p className="text-xs text-ink-500 mt-2">
                  Enter the mobile number linked to your account
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper-600 text-white font-bold rounded-xl hover:bg-copper-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-copper-500/30"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending code...
                  </>
                ) : (
                  'Send verification code'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-ink-500">or</span>
              </div>
            </div>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm font-medium text-copper-600 hover:text-copper-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to standard login
              </Link>
            </div>
          </div>

          {/* Trust Signal */}
          <div className="mt-6 text-center">
            <p className="text-xs text-ink-500">
              By continuing, you agree to our 
              <Link to="/terms" className="text-copper-600 hover:underline mx-1">Terms of Service</Link>
              and 
              <Link to="/privacy" className="text-copper-600 hover:underline mx-1">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWithOtp;