import React, { useState, useEffect, useRef } from 'react'
import { MISSION_CONTENT } from '../constants'

const Mission = () => {
  const [isVisible, setIsVisible] = useState(false)
  const missionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (missionRef.current) {
      observer.observe(missionRef.current)
    }

    return () => {
      if (missionRef.current) {
        observer.unobserve(missionRef.current)
      }
    }
  }, [])

  return (
    <section id="mission" ref={missionRef} className="py-16 bg-gradient-to-br from-harari to-amber-600">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{MISSION_CONTENT.TITLE}</h2>
          <div className="w-20 h-1 bg-white mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Mission Statement */}
          <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission Statement</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {MISSION_CONTENT.STATEMENT}
            </p>
            
            <div className="border-l-4 border-harari pl-4">
              <h4 className="font-bold text-gray-800 mb-2">Our Vision</h4>
              <p className="text-gray-600 italic">
                {MISSION_CONTENT.VISION}
              </p>
            </div>
          </div>

          {/* Goals */}
          <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Our Goals</h3>
            <div className="space-y-4">
              {MISSION_CONTENT.GOALS.map((goal, index) => (
                <div 
                  key={index}
                  className={`flex items-start transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'
                  }`}
                  style={{ transitionDelay: `${700 + index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-harari rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-gray-700">{goal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button 
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-harari px-8 py-3 rounded-full font-medium shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Join Our Mission
          </button>
        </div>
      </div>
    </section>
  )
}

export default Mission