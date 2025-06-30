import React, { useState, useEffect, useRef } from 'react'

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const contactRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (contactRef.current) {
      observer.observe(contactRef.current)
    }

    return () => {
      if (contactRef.current) {
        observer.unobserve(contactRef.current)
      }
    }
  }, [])

  const handleSendMessage = () => {
    setModalType('message')
    setShowModal(true)
    // In a real app, you would integrate with WhatsApp API or messaging service
  }

  const handleViewServices = () => {
    setModalType('services')
    setShowModal(true)
  }

  const handlePhoneCall = () => {
    window.location.href = 'tel:+1(416)-474-8593'
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
  }

  const services = [
    {
      title: "Cultural Education",
      description: "Language classes, history workshops, and cultural immersion programs",
      icon: "📚"
    },
    {
      title: "Community Events",
      description: "Traditional festivals, celebrations, and community gatherings",
      icon: "🎉"
    },
    {
      title: "Youth Programs",
      description: "Leadership development and cultural identity programs for young people",
      icon: "👥"
    },
    {
      title: "Cultural Workshops",
      description: "Hands-on traditional crafts, cooking, and art workshops",
      icon: "🎨"
    }
  ]

  return (
    <>
      <section 
        id="contact" 
        ref={contactRef}
        className="bg-amber-400 text-black px-8 py-24 sm:py-28 md:py-32"
      >
        <div className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          
          <p className="text-2xl text-gray-950 sm:text-3xl md:text-4xl font-medium mb-6">
            Let's Connect and Make It Happen
          </p>
          
          <h3 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-harari mb-6 cursor-pointer hover:text-amber-800 transition-colors duration-300"
            onClick={handlePhoneCall}
          >
            +(416)-474-8593
          </h3>
          
          <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto">
            
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleSendMessage}
              className="bg-harari text-white px-8 py-3 rounded-full font-medium shadow-md hover:bg-amber-800 transition-all duration-300 transform hover:scale-105"
            >
              Send Message
            </button>
            <button 
              onClick={handleViewServices}
              className="bg-white text-harari border border-harari px-8 py-3 rounded-full font-medium shadow-md hover:bg-amber-50 transition-all duration-300 transform hover:scale-105"
            >
              View Services
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {modalType === 'message' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Options</h3>
                <div className="space-y-3">
                  <a 
                    href="https://wa.me/4164748593" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <span className="text-2xl mr-3">📱</span>
                    <div>
                      <div className="font-medium">WhatsApp</div>
                      <div className="text-sm text-gray-600">Send a WhatsApp message</div>
                    </div>
                  </a>
                  <a 
                    href="sms:+4164748593" 
                    className="flex items-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <span className="text-2xl mr-3">💬</span>
                    <div>
                      <div className="font-medium">Text Message</div>
                      <div className="text-sm text-gray-600">Send an SMS</div>
                    </div>
                  </a>
                  <a 
                    href="mailto:hararebdal@gmail.com" 
                    className="flex items-center p-3 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <span className="text-2xl mr-3">📧</span>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-600">Send an email</div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {modalType === 'services' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Our Services</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {services.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">{service.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">{service.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button 
                    onClick={handleSendMessage}
                    className="bg-harari text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-800 transition-colors"
                  >
                    Contact Us About Services
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Contact