// src/pages/AboutUs.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Import your photo
import profileImg from '../assets/Professional Photo (5).png';

const AboutUs = () => {
  const stats = [
    { value: '8,000+', label: 'Products Available', description: 'Curated from trusted brands' },
    { value: '50K+', label: 'Happy Customers', description: 'And growing every day' },
    { value: '4.8★', label: 'Average Rating', description: 'From verified purchases' },
    { value: '24h', label: 'Support Response', description: 'Average reply time' },
  ];

  const values = [
    {
      title: 'Clarity first',
      description: 'Every product page tells you exactly what you need to know — no hidden fees, no confusing specifications.',
      icon: '🔍',
    },
    {
      title: 'Fast by default',
      description: 'We obsess over milliseconds. SwiftCart loads instantly on any device, anywhere.',
      icon: '⚡',
    },
    {
      title: 'Build in public',
      description: 'Our changelog, roadmap, and metrics are transparent. You deserve to know what we\'re working on.',
      icon: '📢',
    },
    {
      title: 'Radically helpful',
      description: 'Support isn\'t a department — it\'s our product. Real humans, real answers, in minutes.',
      icon: '💡',
    },
  ];

  const milestones = [
    { year: '2024', title: 'Public launch', description: 'SwiftCart opens to customers across India' },
    { year: '2024', title: '10,000 orders', description: 'Reached 10,000 successful deliveries' },
    { year: '2025', title: 'Mobile app', description: 'Native iOS and Android apps coming soon' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-copper-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-copper-500/20 via-transparent to-transparent" />
        <div className="container-custom relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-copper-400 rounded-full animate-pulse" />
              Our story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              Building the most
              <span className="text-copper-400 block">trusted place to shop</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              SwiftCart was born from a simple belief: online shopping should be clear, 
              fast, and genuinely helpful. No gimmicks. No hidden agendas. Just great products 
              and a better experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-ink-950">{stat.value}</div>
                <div className="font-semibold text-ink-900 mt-2">{stat.label}</div>
                <div className="text-sm text-ink-500 mt-1">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink-950 mb-4">
              Why we built SwiftCart
            </h2>
            <p className="text-lg text-ink-600 leading-relaxed">
              Most e-commerce platforms are designed to maximize clicks, not help you find 
              what you need. We wanted to build something different.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-ink-700 leading-relaxed mb-4">
                <span className="font-bold text-ink-950">In 2024</span>, our founder Shlok noticed that 
                shopping online had become overwhelming. Endless pop-ups, confusing checkout flows, 
                and product pages that hid the information you actually needed.
              </p>
              <p className="text-ink-700 leading-relaxed mb-4">
                So he built SwiftCart — a lightweight, honest alternative. No distracting carousels, 
                no fake urgency timers, just clear product information and a checkout that works.
              </p>
              <p className="text-ink-700 leading-relaxed">
                What started as a personal project quickly grew into a platform serving thousands 
                of customers. Today, SwiftCart is on a mission to make online shopping feel 
                <span className="font-semibold text-copper-600"> calm, confident, and effortless</span>.
              </p>
            </div>
            <div className="bg-gradient-to-br from-copper-100 to-ink-100 rounded-2xl p-8">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-ink-950 mb-2">Our north star</h3>
              <p className="text-ink-700 leading-relaxed">
                "Reduce the time between wanting something and getting it, without sacrificing trust."
              </p>
              <div className="mt-4 pt-4 border-t border-ink-200">
                <p className="text-sm text-ink-500">— Shlok Thakkar, Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink-950 mb-4">
              How we work
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Four principles guide every decision we make — from product design to customer support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="p-6 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{value.icon}</div>
                <h3 className="text-lg font-bold text-ink-950 mb-2">{value.title}</h3>
                <p className="text-ink-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink-950 mb-4">
              Built by a team that cares
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              We're a small, focused team. Here's who's behind SwiftCart.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <div className="md:flex">
                {/* LEFT SIDE: Clean white background */}
                <div className="md:w-2/5 bg-white md:min-h-[320px] flex items-center justify-center p-6">
                  <div className="w-full max-w-[260px]">
                    <img
                      src={profileImg}
                      alt="Shlok Thakkar - Founder & Product Engineer"
                      className="w-full h-auto rounded-lg shadow-md object-cover"
                      style={{ aspectRatio: '4/5' }}
                    />
                  </div>
                </div>
                
                {/* RIGHT SIDE: Bio Content */}
                <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-copper-50 text-copper-700 rounded-full px-3 py-1 text-xs font-semibold w-fit mb-3">
                    Founder & Product Engineer
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-ink-950">Shlok Thakkar</h3>
                  <p className="text-copper-600 font-medium mb-4">Building simple, honest e-commerce</p>
                  
                  <p className="text-ink-600 leading-relaxed mb-4">
                    Shlok builds SwiftCart with a focus on performance, clarity, and user trust. 
                    A second-year Computer Engineering student who believes that great software 
                    doesn't need to be complicated — just thoughtful.
                  </p>
                  
                  <p className="text-ink-600 leading-relaxed mb-5">
                    When he's not coding, Shlok studies product design patterns, contributes to 
                    open source, and thinks about how to make online shopping less overwhelming.
                  </p>
                  
                  <div className="flex gap-6 pt-3">
                    <a
                      href="https://github.com/ThakkarShlok"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-ink-600 hover:text-ink-950 transition-colors group"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">GitHub</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/shlok-thakkar-58a033354"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-ink-600 hover:text-ink-950 transition-colors group"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                      </svg>
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline / Milestones */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink-950 mb-4">
              The journey so far
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              From first line of code to serving thousands of customers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gray-200" />
              {milestones.map((milestone, idx) => (
                <div key={milestone.year} className={`relative flex flex-col md:flex-row gap-4 mb-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 md:text-right">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="text-copper-600 font-bold text-sm">{milestone.year}</div>
                      <h3 className="font-bold text-ink-950 mt-1">{milestone.title}</h3>
                      <p className="text-sm text-ink-600 mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-3 md:left-1/2 top-4 transform md:-translate-x-1/2 w-3 h-3 bg-copper-500 rounded-full border-2 border-white" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - FIXED BUTTON VISIBILITY */}
      <section className="py-20 bg-gradient-to-r from-copper-600 to-copper-700">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join us on this journey
          </h2>
          <p className="text-copper-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Whether you're shopping for something new or interested in building the future 
            of e-commerce, we'd love to have you along.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* White button - clearly visible */}
            <Link to="/shop">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-copper-700 font-bold rounded-xl shadow-md hover:bg-gray-100 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/30 min-w-[160px]">
                Start shopping
              </button>
            </Link>
            
            {/* Outline button */}
            <Link to="/contact">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/30 min-w-[160px]">
                Contact us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;