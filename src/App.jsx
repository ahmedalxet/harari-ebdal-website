import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Contact from './components/Contact';
import Donation from './components/Donations';
import Mission from './components/Mission';
import Footer from './components/Footer';
import './index.css';

function App() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="min-h-screen relative text-sm sm:text-base">
            <Header isScrolled={isScrolled} />
            <main>
                <Hero />
                <About />
                <Mission />
                <Donation />
                <Contact />
            </main>
            <Footer />
        </div>
    );
}

export default App;