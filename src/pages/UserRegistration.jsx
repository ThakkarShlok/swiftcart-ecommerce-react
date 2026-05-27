// src/UserRegistration.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const UserRegistration = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const REGISTER_URL = getApiUrl('api-user-register.php');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !mobile) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('user_name', name);
      dataPayload.append('user_email', email);
      dataPayload.append('user_password', password);
      dataPayload.append('user_mobile', mobile);

      const res = await axios.post(REGISTER_URL, dataPayload, {
        headers: authHeaders(API_TOKEN)
      });

      if (String(res.data.flag) === "1" || res.data.flag == 1) {
        alert(res.data.message || "Account created successfully!");
        if (onRegisterSuccess) {
          onRegisterSuccess(); // Redirects to login page
        } else {
          navigate('/login');
        }
      } else {
        alert(res.data.message || "Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "8px", fontFamily: "Arial, sans-serif" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "normal", margin: "0 0 20px 0" }}>Create account</h3>
      
      <form onSubmit={handleRegisterSubmit}>
        {/* Your Name Input */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Your name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="First and last name"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px", borderRadius: "4px", border: "1px solid #a6a6a6", fontSize: "14px" }} 
            required 
          />
        </div>

        {/* Mobile Number Input */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Mobile number</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <span style={{ padding: "8px 10px", backgroundColor: "#f0f2f2", border: "1px solid #a6a6a6", borderRadius: "4px", fontSize: "14px", color: "#565959" }}>+91</span>
            <input 
              type="tel" 
              maxLength="10"
              value={mobile} 
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} // Numbers only
              placeholder="10-digit mobile number"
              style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #a6a6a6", fontSize: "14px" }} 
              required 
            />
          </div>
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Email (optional)</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: "100%", boxSizing: "border-box", padding: "8px", borderRadius: "4px", border: "1px solid #a6a6a6", fontSize: "14px" }} 
            required 
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="At least 6 characters"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px", borderRadius: "4px", border: "1px solid #a6a6a6", fontSize: "14px" }} 
            required 
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#ffd814", borderColor: "#fcd200", color: "#0f1111", border: "1px solid", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
        >
          {loading ? "Creating Account..." : "Verify mobile number"}
        </button>
      </form>

      {/* Already have an account text link */}
      <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px", fontSize: "13px" }}>
        <span>Already have an account? </span>
        <Link to="/login" style={{ color: "#007185", textDecoration: "none" }}>
          Sign in →
        </Link>
      </div>
    </div>
  );
};

export default UserRegistration;