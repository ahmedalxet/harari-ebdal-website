import React, { useState, useEffect, useRef } from 'react'
import { ABOUT_CONTENT } from '../constants'

const About = () => {
  const [isVisible, setIsVisible] = useState(false)
  const aboutRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (aboutRef.current) {
      observer.observe(aboutRef.current)
    }

    return () => {
      if (aboutRef.current) {
        observer.unobserve(aboutRef.current)
      }
    }
  }, [])

  return (
    <section id="about" ref={aboutRef} className="bg-white px-8 py-20 sm:py-24 md:py-28">
      <div className="w-full mx-auto max-w-[1200px] flex flex-col gap-16">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{ABOUT_CONTENT.TITLE}</h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto"></div>
        </div>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Image Column */}
          <div className={`lg:w-1/2 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <div className="relative rounded-xl overflow-hidden shadow-xl h-64 md:h-96 group">
              <img 
                src={ABOUT_CONTENT.IMAGE}
                alt="Harari Cultural Heritage" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>

          {/* Text Column */}
          <div className={`lg:w-1/2 space-y-6 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {ABOUT_CONTENT.SUBTITLE}
            </h3>
            
            <p className="text-gray-600 leading-relaxed">
              {ABOUT_CONTENT.DESCRIPTION}
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <h4 className="font-bold text-gray-800 mb-2">{ABOUT_CONTENT.APPROACH_TITLE}</h4>
              <p className="text-gray-600">
                {ABOUT_CONTENT.APPROACH_TEXT}
              </p>
            </div>

            <ul className="space-y-3 text-gray-600">
              {ABOUT_CONTENT.FEATURES.map((feature, index) => (
                <li 
                  key={index}
                  className={`flex items-start transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'
                  }`}
                  style={{ transitionDelay: `${700 + index * 100}ms` }}
                >
                  <svg className="h-5 w-5 text-amber-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <p className="text-gray-600 leading-relaxed">
              {ABOUT_CONTENT.CLOSING_TEXT}
            </p>

            <button 
              onClick={() => document.getElementById('mission').scrollIntoView({ behavior: 'smooth' })}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About