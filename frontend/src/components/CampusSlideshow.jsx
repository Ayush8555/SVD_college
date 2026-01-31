import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import campus images
import campusFront from '../assets/campus_front.png';
import campusGround from '../assets/campus_ground.jpg';
import collegeBuildingImg from '../assets/college_building.jpg';

const CampusSlideshow = ({ cleanMode = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
    
    const slides = [
        {
            image: campusFront,
            title: "Main Campus",
            subtitle: "SVD Gurukul Mahavidyalaya"
        },
        {
            image: campusGround,
            title: "Sprawling Sports Ground",
            subtitle: "State-of-the-art Athletic Facilities"
        },
        {
            image: collegeBuildingImg,
            title: "Academic Block",
            subtitle: "Modern Learning Environment"
        }
    ];

    // Auto-slide every 5 seconds (pauses on hover)
    useEffect(() => {
        if (isPaused) return;
        
        const interval = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length, isPaused]);

    const goToSlide = useCallback((index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    }, [currentIndex]);

    const goNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const goPrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 1.1
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <div 
            className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 z-10 pointer-events-none" />
            
            {/* Slides with Ken Burns effect */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    <motion.img
                        src={slides[currentIndex].image}
                        alt={slides[currentIndex].title}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1 }}
                        animate={{ scale: isPaused ? 1 : 1.05 }}
                        transition={{ duration: 5, ease: "linear" }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <span className="inline-block px-4 py-1.5 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 shadow-lg">
                            📍 Our Campus
                        </span>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                            {slides[currentIndex].title}
                        </h3>
                        <p className="text-white/80 text-lg font-light">
                            {slides[currentIndex].subtitle}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnail Navigation */}
            {!cleanMode && (
                <div className="absolute bottom-8 right-8 z-20 flex gap-3">
                    {slides.map((slide, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToSlide(index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                index === currentIndex
                                    ? 'border-orange-500 shadow-lg shadow-orange-500/30'
                                    : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                            }`}
                            aria-label={`Go to ${slide.title}`}
                        >
                            <img 
                                src={slide.image} 
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            {index === currentIndex && (
                                <motion.div
                                    layoutId="activeThumb"
                                    className="absolute inset-0 bg-orange-500/20"
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Arrow Navigation - Always visible with hover enhancement */}
            <motion.button
                onClick={goPrev}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                aria-label="Previous slide"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </motion.button>
            <motion.button
                onClick={goNext}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                aria-label="Next slide"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </motion.button>

            {/* Slide Counter */}
            {!cleanMode && (
                <div className="absolute top-6 right-6 z-20">
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
                        <span className="text-white font-bold text-lg">{currentIndex + 1}</span>
                        <span className="text-white/50">/</span>
                        <span className="text-white/70 text-sm">{slides.length}</span>
                    </div>
                </div>
            )}

            {/* Pause/Play Indicator on Hover */}
            {!cleanMode && (
                <AnimatePresence>
                    {isPaused && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-6 left-6 z-20"
                        >
                            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                                <span className="text-white text-xs font-medium">Paused</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Interactive Corner Decoration */}
            {!cleanMode && (
                <>
                    <div className="absolute top-0 left-0 w-32 h-32 z-10 pointer-events-none">
                        <div className="absolute top-4 left-4 w-12 h-[2px] bg-gradient-to-r from-orange-500 to-transparent" />
                        <div className="absolute top-4 left-4 w-[2px] h-12 bg-gradient-to-b from-orange-500 to-transparent" />
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 z-10 pointer-events-none">
                        <div className="absolute top-4 right-4 w-12 h-[2px] bg-gradient-to-l from-orange-500 to-transparent" />
                        <div className="absolute top-4 right-4 w-[2px] h-12 bg-gradient-to-b from-orange-500 to-transparent" />
                    </div>
                </>
            )}
        </div>
    );
};

export default CampusSlideshow;

