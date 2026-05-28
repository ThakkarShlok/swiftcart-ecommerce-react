// src/pages/VerifyOtp.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const VerifyOtp = ({ onLoginSuccess }) => {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const location = useLocation();
  const navigate = useNavigate();

  const mobileNumber = location.state?.mobileNumber || "";
  const [displayOtp, setDisplayOtp] = useState(location.state?.incomingOtp || "");

  // Timer for resend button
  useEffect(() => {
    if (timeLeft > 0 && !resending) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, resending]);

  // Reset timer when resend is triggered
  useEffect(() => {
    if (!resending) {
      setTimeLeft(60);
    }
  }, [resending]);

  // Prevent direct URL entry
  useEffect(() => {
    if (!mobileNumber) {
      alert("Invalid session. Please initiate login again.");
      navigate('/login-otp');
    }
  }, [mobileNumber, navigate]);

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otpCode.trim()) {
      alert("Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_mobile', mobileNumber);
      payload.append('mobile_otp', otpCode.trim());

      const res = await axios.post(getApiUrl('api-otp-verify.php'), payload, {
        headers: authHeaders(API_TOKEN)
      });

      if (String(res.data.flag) === "1") {
        const userId = res.data.user_id || res.data.user_details?.user_id;
        const userName = res.data.user_name || res.data.user_details?.user_name || "Customer Profile";

        if (!userId) {
          alert("Authenticated successfully, but failed to retrieve user data.");
          return;
        }

        localStorage.setItem('stored_user_id', String(userId));
        localStorage.setItem('stored_user_name', userName);
        alert(res.data.message || "Successfully logged in!");

        onLoginSuccess({ user_id: userId, user_name: userName });
        navigate('/');
      } else {
        alert(res.data.message || "Invalid code entered. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) {
      alert(`Please wait ${timeLeft} seconds before requesting a new code.`);
      return;
    }

    setResending(true);
    try {
      const payload = new FormData();
      payload.append('user_mobile', mobileNumber);

      const res = await axios.post(getApiUrl('api-otp-login.php'), payload, {
        headers: authHeaders(API_TOKEN)
      });

      if (String(res.data.flag) === "1") {
        alert("New verification code sent successfully!");
        if (res.data.mobile_otp) {
          setDisplayOtp(res.data.mobile_otp);
        }
        setOtpCode(''); // Clear old OTP
        setTimeLeft(60); // Reset timer
      } else {
        alert(res.data.message || "Unable to resend code at this time.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      alert("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Format mobile number for display (masked)
  const formatMobileNumber = (mobile) => {
    if (!mobile) return "";
    return `+91-${mobile.slice(0, 5)}*****`;
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
              Verify your identity
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-ink-950 mb-3">
              Enter verification code
            </h1>
            <p className="text-ink-600">
              We sent a code to {formatMobileNumber(mobileNumber)}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            {/* Demo Mode Notification */}
            {displayOtp && (
              <div className="mb-6 p-4 bg-copper-50 border border-copper-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-copper-100 rounded-lg flex items-center justify-center">
                    <span className="text-copper-600 text-sm font-bold">ℹ️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-copper-800 mb-1">Demo Environment</p>
                    <p className="text-sm text-copper-700">
                      Use this code for verification: 
                      <span className="font-bold text-lg ml-2 tracking-wider">{displayOtp}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">
                  Verification code
                </label>
                <input 
                  type="text" 
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="field w-full text-center text-lg tracking-widest font-mono"
                  autoFocus
                  required
                />
                <p className="text-xs text-ink-500 mt-2 text-center">
                  Enter the 6-digit verification code sent to your mobile
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || !otpCode.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper-600 text-white font-bold rounded-xl hover:bg-copper-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-copper-500/30"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify & continue'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-ink-500">didn't receive code?</span>
              </div>
            </div>

            {/* Resend Section */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending || timeLeft > 0}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-ink-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending new code...
                  </>
                ) : timeLeft > 0 ? (
                  `Resend code in ${timeLeft}s`
                ) : (
                  'Resend verification code'
                )}
              </button>

              {/* Change Mobile Number Link */}
              <div className="text-center">
                <Link 
                  to="/login-otp" 
                  className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-copper-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Use a different mobile number
                </Link>
              </div>
            </div>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-ink-500">
              Having trouble? 
              <Link to="/contact" className="text-copper-600 hover:underline ml-1">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;