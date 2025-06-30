import React, { useState, useEffect } from 'react'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToNext = () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section 
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: "url('/image/shewal.jpg')" }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Content container */}
      <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Main title with elegant font */}
        <h1 className="text-white font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
          Werota Werasot
        </h1>
        
        {/* Subheading with beautiful typography */}
        <div className="space-y-2 mb-8">
          <p className="text-white font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-wide">
            Passing Harari Culture
          </p>
          <p className="text-white font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-wide">
            To The Next Generation
          </p>
        </div>
        
        {/* Organization name with accent styling */}
        <div className="inline-block border-t-2 border-white pt-4">
          <p className="text-white font-serif text-xl sm:text-2xl md:text-3xl font-medium italic tracking-wider">
            Harari EBDAL Mugad
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div 
          className="w-fit mx-auto my-20 flex flex-col items-center gap-4 animate-bounce cursor-pointer"
          onClick={scrollToNext}
        >
          <p className="text-white font-light tracking-wider">Scroll for more</p>
          <div className="w-px h-24 bg-gradient-to-b my-2 from-slate-400 to-transparent"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero