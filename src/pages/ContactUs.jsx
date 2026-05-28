// src/pages/ContactUs.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Us',
      details: ['support@swiftcart.com', 'careers@swiftcart.com'],
      action: 'mailto:support@swiftcart.com',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Call Us',
      details: ['+91 79 2324 0000', 'Mon-Fri, 9AM - 6PM'],
      action: 'tel:+917923240000',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Visit Us',
      details: ['A-1705 Mondeal Heights', 'Satellite, Ahmedabad, Gujarat'],
      action: 'https://maps.google.com/?q=Mondeal+Heights+Ahmedabad',
    },
  ];

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Orders are typically delivered within 2-4 business days within India. You\'ll receive a tracking link once your order ships.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer 30-day hassle-free returns on most products. Items must be unused and in original packaging.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Log into your account and visit the Orders page. You\'ll find real-time tracking information there.',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently we ship only within India. International shipping will be available in Q2 2025.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-copper-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-copper-500/20 via-transparent to-transparent" />
        <div className="container-custom relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-copper-400 rounded-full animate-pulse" />
              Get in touch
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              We're here to
              <span className="text-copper-400 block">help you succeed</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about your order, need product recommendations, or just want to say hello? 
              Our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, idx) => (
              <a
                key={idx}
                href={method.action}
                target={method.action.startsWith('http') ? '_blank' : '_self'}
                rel={method.action.startsWith('http') ? 'noopener noreferrer' : ''}
                className="group p-6 rounded-xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center block"
              >
                <div className="w-12 h-12 bg-copper-50 rounded-xl flex items-center justify-center text-copper-600 mx-auto mb-4 group-hover:bg-copper-600 group-hover:text-white transition-colors duration-300">
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-ink-950 mb-2">{method.title}</h3>
                {method.details.map((detail, i) => (
                  <p key={i} className="text-ink-600 text-sm">{detail}</p>
                ))}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <p className="eyebrow text-copper-600">Send a message</p>
                <h2 className="text-2xl md:text-3xl font-bold text-ink-950 mt-2">We'd love to hear from you</h2>
                <p className="text-ink-600 mt-2">Fill out the form and we'll respond within 24 hours.</p>
              </div>

              {submitted && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                  ✅ Thank you for reaching out! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">
                    Full name <span className="text-copper-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">
                    Email address <span className="text-copper-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="hello@example.com"
                    className="field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Order #12345, Product question, etc."
                    className="field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">
                    Message <span className="text-copper-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    className="field w-full resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper-600 text-white font-bold rounded-xl hover:bg-copper-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-copper-500/30"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send message'
                  )}
                </button>

                <p className="text-xs text-ink-500 text-center pt-2">
                  By submitting, you agree to our <Link to="/privacy" className="text-copper-600 hover:underline">Privacy Policy</Link>
                </p>
              </form>
            </div>

            {/* Right Column - Map & Business Info */}
            <div className="space-y-6">
              {/* Map Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-64 bg-gray-200 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.944875397286!2d72.547667!3d23.022559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e8498f0b7d2c5%3A0x8f5b8e3c2a9f8b5d!2sMondeal%20Heights!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SwiftCart Office Location"
                    className="grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-ink-950 mb-2">Corporate Headquarters</h3>
                  <p className="text-ink-600 text-sm leading-relaxed">
                    A-1705 Mondeal Heights,<br />
                    Near Iscon Cross Road, Satellite,<br />
                    Ahmedabad, Gujarat - 380015<br />
                    India
                  </p>
                </div>
              </div>

              {/* Business Hours Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-copper-50 rounded-xl flex items-center justify-center text-copper-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-ink-950">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-600">Monday - Friday</span>
                    <span className="font-medium text-ink-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Saturday</span>
                    <span className="font-medium text-ink-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Sunday</span>
                    <span className="font-medium text-ink-900">Closed</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-ink-500">
                    <span className="font-medium">Response time:</span> Within 24 hours for emails,<br />
                    within 2 hours for calls during business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="eyebrow text-copper-600">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-ink-950 mt-2 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Find quick answers to common questions. Can't find what you're looking for? Contact us directly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300">
                <h3 className="font-bold text-ink-950 mb-2">{faq.question}</h3>
                <p className="text-ink-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-copper-600 to-copper-700">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Need immediate assistance?
          </h2>
          <p className="text-copper-100 mb-6">
            Our support team is just a call away during business hours.
          </p>
          <a
            href="tel:+917923240000"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-copper-700 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call us: +91 79 2324 0000
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;