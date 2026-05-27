// src/UserLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const loginData = new FormData();
      loginData.append('user_email', email);
      loginData.append('user_password', password);

      const res = await axios.post(LOGIN_URL, loginData, {
        headers: authHeaders(API_TOKEN)
      });

      if (String(res.data.flag) === "1") {
        const userId = res.data.user_id || res.data.user_details?.user_id;
        const userName = res.data.user_name || res.data.user_details?.user_name || "Customer";

        if (!userId) {
          alert("Server failed to deliver a valid user identifier.");
          return;
        }

        localStorage.setItem('stored_user_id', String(userId));
        localStorage.setItem('stored_user_name', userName);
        alert(res.data.message || "Logged in successfully.");

        onLoginSuccess({ user_id: userId, user_name: userName });
        navigate('/');
      } else {
        alert(res.data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Network error processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "8px", fontFamily: "Arial, sans-serif" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "normal", margin: "0 0 20px 0" }}>Sign in</h3>
      
      <form onSubmit={handleLoginSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: "100%", boxSizing: "border-box", padding: "8px", borderRadius: "4px", border: "1px solid #a6a6a6" }} 
            required 
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: "100%", boxSizing: "border-box", padding: "8px", borderRadius: "4px", border: "1px solid #a6a6a6" }} 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#ffd814", borderColor: "#fcd200", color: "#0f1111", border: "1px solid", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>

      <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px", fontSize: "13px", textAlign: "center" }}>
        <p style={{ margin: "0 0 10px 0" }}>Prefer a secure code instead?</p>
        <Link 
          to="/login-otp" 
          style={{ display: "inline-block", width: "100%", boxSizing: "border-box", padding: "8px", backgroundColor: "#fff", border: "1px solid #d5d9d9", borderRadius: "8px", color: "#0f1111", textDecoration: "none", fontWeight: "500" }}
        >
          Login with OTP
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;