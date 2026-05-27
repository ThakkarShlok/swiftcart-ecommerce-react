// src/VerifyOtp.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const VerifyOtp = ({ onLoginSuccess }) => {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve routing variables safely
  const mobileNumber = location.state?.mobileNumber || "";
  const [displayOtp, setDisplayOtp] = useState(location.state?.incomingOtp || "");

  // Prevent direct URL entry access to verify view without mobile variables context
  useEffect(() => {
    if (!mobileNumber) {
      alert("Invalid session routing context. Please initiate sign in process again.");
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
          alert("Authenticated successfully, but failed to retrieve user data keys.");
          return;
        }

        localStorage.setItem('stored_user_id', String(userId));
        localStorage.setItem('stored_user_name', userName);
        alert(res.data.message || "Successfully logged in!");

        onLoginSuccess({ user_id: userId, user_name: userName });
        navigate('/');
      } else {
        alert(res.data.message || "Invalid code entered. Please verify and try again.");
      }
    } catch (err) {
      console.error("Verification processing error:", err);
      alert("Validation pipelines timing out. Please check parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const payload = new FormData();
      payload.append('user_mobile', mobileNumber);

      const res = await axios.post(getApiUrl('api-otp-resend.php'), payload, {
        headers: authHeaders(API_TOKEN)
      });

      if (String(res.data.flag) === "1") {
        alert("A new mock validation token has been generated on screen.");
        if (res.data.mobile_otp) {
          setDisplayOtp(res.data.mobile_otp);
        }
      } else {
        alert(res.data.message || "Unable to resend code at this time.");
      }
    } catch (err) {
      console.error("Resend API communication error:", err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "8px", fontFamily: "Arial, sans-serif" }}>
      
      {/* 🟢 DEV ENVIRONMENT NOTIFICATION BOX */}
      {displayOtp && (
        <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#e8f4fd", border: "1px solid #d0e7fc", borderRadius: "6px", color: "#1d6fa5", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>
          Demo Mode OTP Code: <span style={{ fontSize: "18px", color: "#114b71", letterSpacing: "1px" }}>{displayOtp}</span>
        </div>
      )}

      <h3 style={{ fontSize: "24px", fontWeight: "normal", margin: "0 0 10px 0" }}>Enter Verification Code</h3>
      
      {/* 🟢 FIXED MESSAGE: Explains how it works in demo mode instead of lying about an SMS */}
      <p style={{ fontSize: "13px", color: "#565959", margin: "0 0 20px 0", lineHeight: "1.5" }}>
        Account found for phone ending in <strong>{mobileNumber.slice(-4)}</strong>. 
        <br />
        <span style={{ color: "#c45500", fontWeight: "500" }}>
          Since this is a sandbox demo environment, copy the blue generated code above into the box below to complete your login.
        </span>
      </p>

      <form onSubmit={handleVerifyOtpSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Verification code</label>
          <input 
            type="text" 
            maxLength="6"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit code"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "4px", border: "1px solid #a6a6a6", fontSize: "16px", textAlign: "center" }}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#ffd814", borderColor: "#fcd200", color: "#0f1111", border: "1px solid", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", marginBottom: "15px" }}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
        <button 
          type="button"
          onClick={handleResendCode}
          disabled={resending}
          style={{ background: "none", border: "none", color: "#007185", cursor: "pointer", padding: 0, fontSize: "13px" }}
        >
          {resending ? "Generating new code..." : "Generate New OTP"}
        </button>
        <Link to="/login-otp" style={{ color: "#007185", textDecoration: "none" }}>Change mobile number</Link>
      </div>
    </div>
  );
};

export default VerifyOtp;