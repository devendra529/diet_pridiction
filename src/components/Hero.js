'use client';
import { useState, useEffect } from 'react';
import styles from '../styles/Hero.module.css';

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "AI-Powered Diet Prediction",
      subtitle: "Get personalized meal plans tailored to your health goals",
      poster: "/images/slide1.jpg",
    },
    {
      title: "Track Your Nutrition",
      subtitle: "Monitor calories, macros, and nutrients effortlessly",
      poster: "/images/slide2.jpg",
    },
    {
      title: "Achieve Your Goals",
      subtitle: "Weight loss, muscle gain, or healthy living - we've got you",
      poster: "/images/slide3.jpg",
    },
    {
      title: "Smart Recommendations",
      subtitle: "Based on your preferences, allergies, and lifestyle",
      poster: "/images/slide4.jpg",
    },
    {
      title: "Start Your Journey",
      subtitle: "Join thousands improving their health through better nutrition",
      poster: "/images/slide5.jpg",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // ⏱ Change every 5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className={styles.hero}>
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`${styles.slide} ${activeSlide === index ? styles.active : ''}`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.6)), url(${slide.poster})`,
          }}
        >
          <div className={styles.slideContent}>
            <h1 className={styles.slideTitle}>{slide.title}</h1>
            <p className={styles.slideSubtitle}>{slide.subtitle}</p>
            <button className={styles.ctaButton}>Start Diet Prediction</button>
          </div>
        </div>
      ))}

      {/* navigation dots */}
      <div className={styles.dots}>
        {slides.map((_, index) => (
          <div
            key={index}
            className={`${styles.dot} ${activeSlide === index ? styles.active : ''}`}
            onClick={() => setActiveSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
