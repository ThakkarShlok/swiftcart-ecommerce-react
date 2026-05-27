// src/ContactUs.jsx
import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${formData.name}, your ticket has been logged with our support desk.`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '2rem' }}>Get In Touch With Us</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Have questions or encounter technical issues? Our operations desk is here to assist 24/7.</p>
      </div>

      <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
        {/* Support Grid Left Side */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Corporate Headquarters</h3>
          <p style={{ color: '#475569' }}><strong>📍 Location:</strong> A-1705 Mondeal Heights, Satellite, Ahmedabad, Gujarat, India</p>
          <p style={{ color: '#475569' }}><strong>✉️ Support Mailbox:</strong> helpdesk@googlytechnologies.com</p>
          <p style={{ color: '#475569' }}><strong>📞 Customer Help Line:</strong> +91 79 2324 0000</p>
          
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #3498db' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
              *Response Turnaround Window: Under 2 hours across standard ticketing pipelines.
            </p>
          </div>
        </div>

        {/* Customer Ticket Form Right Side */}
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '15px' }}>Drop a Message</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Your Name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <input 
              type="email" 
              placeholder="Your Email Address" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <textarea 
              placeholder="How can our engineering desk assist you?" 
              rows="4" 
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;