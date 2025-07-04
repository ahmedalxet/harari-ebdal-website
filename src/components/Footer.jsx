import React, { useState } from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Newsletter subscription state
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Mission', href: '#mission' },
    { label: 'Contact', href: '#contact' }
  ]

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: '📘', 
      href: '#',
      hoverColor: 'hover:text-blue-500' 
    },
    { 
      name: 'Instagram', 
      icon: '📷', 
      href: 'https://www.instagram.com/hararebdal/',
      hoverColor: 'hover:text-pink-500' 
    },
    { 
      name: 'Twitter', 
      icon: '🐦', 
      href: 'https://x.com/hararEBDALmugad',
      hoverColor: 'hover:text-blue-400' 
    },
    { 
      name: 'YouTube', 
      icon: '📺', 
      href: 'https://www.youtube.com/@hararebdal',
      hoverColor: 'hover:text-red-500' 
    }
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('') // Clear previous message
    
    try {
      const response = await fetch('http://localhost:4000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      
      const data = await response.json()
      setMessage(data.message || 'Subscription successful!')
      if (response.ok) setEmail('') // Clear email field on success
    } catch (error) {
      setMessage('Subscription failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-gray-800 text-white py-12 relative">
      <div className="container mx-auto px-6">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Organization Info */}
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-harari mb-4 cursor-pointer hover:text-amber-400 transition-colors" onClick={scrollToTop}>
              Harari EBDAL Mugad
            </div>
            <p className="text-gray-400 leading-relaxed">
              Preserving the rich heritage of Harari culture for future generations through education, community engagement, and cultural celebration.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4 text-harari">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.href)}
                  className="text-gray-300 hover:text-harari transition-colors duration-300 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Social */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold mb-4 text-harari">Connect With Us</h4>
            <div className="space-y-2 mb-4">
              <p className="text-gray-300">
                <span className="text-harari">Phone:</span> 
                <a href="tel:++1(647)-557-2633" className="hover:text-harari transition-colors ml-1">
                  +1(647)-557-2633
                </a>
              </p>
              <p className="text-gray-300">
                <span className="text-harari">Email:</span> 
                <a href="mailto:hararebdal@gmail.com" className="hover:text-harari transition-colors ml-1">
                  hararebdal@gmail.com
                </a>
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex justify-center md:justify-end space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl ${social.hoverColor} transition-all duration-300 transform hover:scale-110`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="text-center max-w-md mx-auto">
            <h4 className="text-lg font-semibold mb-2 text-harari">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for updates on events and programs</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-harari transition-colors"
                required
                disabled={isSubmitting}
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-harari hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {message && (
              <p className={`mt-3 text-sm ${
                message.includes('failed') || message.includes('error') 
                  ? 'text-red-400' 
                  : 'text-green-400'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>© {currentYear} Harari EBDAL Mugad. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2 text-sm">
            <a href="#" className="hover:text-harari transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-harari transition-colors">Terms of Service</a>
          </div>
        </div>

        {/* Back to Top Button */}
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-harari text-white p-3 rounded-full shadow-lg hover:bg-amber-700 transition-colors duration-300 transform hover:scale-110"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </footer>
  )
}

export default Footer