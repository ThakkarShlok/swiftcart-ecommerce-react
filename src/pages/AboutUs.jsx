// src/AboutUs.jsx
import React from 'react';
// Explicitly import the photo asset from your assets folder so the bundler processes it
import profileImg from '../assets/Professional Photo (5).png';

const AboutUs = () => {
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* Brand Journey Header */}
      <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '2rem' }}>About SwiftCart</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>The flagship high-performance e-commerce ecosystem of Googly Technologies.</p>
      </div>

      {/* Corporate Profile & Technical Overview */}
      <div style={{ marginBottom: '40px', lineHeight: '1.7', color: '#334155' }}>
        <h3 style={{ color: '#2c3e50', fontSize: '1.4rem', fontWeight: '600' }}>Corporate Profile & Architectural Vision</h3>
        <p style={{ marginBottom: '15px' }}>
          <strong>SwiftCart</strong> stands as a production-grade digital commerce platform engineered under the technical umbrella of <strong>Googly Technologies</strong>. Designed to dismantle the bottlenecks inherent in legacy, monolithic architectures, SwiftCart operates on an asynchronous, decoupled client-server model optimized to process intricate B2C data pipelines with unyielding transactional consistency and rapid rendering performance.
        </p>
        <p>
          By leveraging a highly optimized infrastructure layer, the ecosystem establishes a direct, frictionless conduit between high-demand hardware asset provisioning and responsive consumer interfaces. The platform maintains a strict separation of concerns, managing complex component lifecycles and predictable state synchronization layers to completely neutralize data mutation risks during intense, high-concurrency request windows.
        </p>
      </div>

      {/* Executive Leadership Board Section (With High-Tech Layout) */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '35px 30px', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '25px', fontSize: '1.4rem' }}>
          Engineering & Corporate Leadership
        </h3>
        
        <div style={{ display: 'flex', gap: '35px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Executive Frame Layout */}
          <div style={{ 
            flex: '0 0 240px', 
            height: '240px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1px solid #cbd5e1', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            backgroundColor: '#e2e8f0'
          }}>
            <img 
              src={profileImg} 
              alt="Shlok Thakkar - Founder & CTO" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Profile Bio Details Block */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: '700' }}>Shlok Thakkar</h4>
            <p style={{ margin: '0 0 14px 0', color: '#3498db', fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.5px' }}>
              Founder & Chief Technology Officer (CTO)
            </p>
            
            {/* 🟢 IMPACT-DRIVEN LEADERSHIP BIO */}
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Shlok actively shapes the technical trajectory, engineering standards, and architectural blueprints across Googly Technologies' digital portfolios. Driven by a commitment to rigorous algorithmic efficiency and defensive programming, he has structured NexusMart to minimize browser overhead and maximize resource utilization. By implementing a stateless microservices strategy, designing low-overhead declarative memory architectures, and establishing deterministic cache invalidation hooks, Shlok has successfully protected the transaction network from thread-blocking bottlenecks. His hand-on engineering leadership ensures that the platform effortlessly absorbs volatile traffic surges, maintaining a fluid, fault-tolerant user experience even under peak operational loads.
            </p>

            {/* Hyperlink Professional Portals Setup */}
            <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <a href="https://github.com/ThakkarShlok" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontSize: '13px', fontWeight: '600' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" width="18" height="18" />
                <span>GitHub Portal</span>
              </a>
              <a href="https://www.linkedin.com/in/shlok-thakkar-58a033354?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#475569', fontSize: '13px', fontWeight: '600' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="18" height="18" />
                <span>LinkedIn Profile</span>
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AboutUs;