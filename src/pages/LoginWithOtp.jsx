// src/LoginWithOtp.jsx
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
        // Extract the generated OTP directly out of the server response keys
        const receivedOtp = res.data.mobile_otp || res.data.otp || "";
        
        alert(res.data.message || "OTP sent successfully!");
        
        // Securely transition the user while passing the mobile and OTP values down the pipeline state
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
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "8px", fontFamily: "Arial, sans-serif" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "normal", margin: "0 0 10px 0" }}>Login with OTP</h3>
      <p style={{ fontSize: "13px", color: "#565959", margin: "0 0 20px 0" }}>We will send a text message with a verification code to your mobile number.</p>

      <form onSubmit={handleSendOtp}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Mobile number</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <span style={{ padding: "8px 12px", backgroundColor: "#f0f2f2", border: "1px solid #a6a6a6", borderRadius: "4px", fontSize: "14px", color: "#565959" }}>+91</span>
            <input 
              type="tel" 
              maxLength="10"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #a6a6a6", fontSize: "14px" }}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#ffd814", borderColor: "#fcd200", color: "#0f1111", border: "1px solid", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
        >
          {loading ? "Sending Code..." : "Get OTP"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px" }}>
        <Link to="/login" style={{ color: "#007185", textDecoration: "none" }}>Back to standard login</Link>
      </div>
    </div>
  );
};

export default LoginWithOtp;