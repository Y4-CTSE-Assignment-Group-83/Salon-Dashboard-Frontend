"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  Scissors,
  Heart,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

// ============================================
// IMPORT LOCAL IMAGES
// ============================================
// Hero/Slider Images - Replace these with your actual image imports
import hero1 from "../../assets/home/image1.svg";
import hero2 from "../../assets/home/image2.svg";
import hero3 from "../../assets/home/image3.svg";
import hero4 from "../../assets/home/image4.svg";

// Gallery Images - Horizontal Scroll
import gallery1 from "../../assets/home/Luxury Hair Styling.jpg";
import gallery2 from "../../assets/home/Signature Treatment.jpg";
import gallery3 from "../../assets/home/hairstyle.jpg";
import gallery4 from "../../assets/home/oiling.jpg";
import gallery5 from "../../assets/home/men.jpg";
import gallery6 from "../../assets/home/coloring.jpg";

// Vertical Stylist Images
import stylist1 from "../../assets/home/banner1.svg";
import stylist2 from "../../assets/home/banner2.svg";
import stylist3 from "../../assets/home/banner3.svg";

// Fallback placeholder if images don't exist yet
import logoImage from "../../assets/home/image1.svg";

// ============================================
// TYPE DEFINITIONS
// ============================================
interface ImageRotatorProps {
  images: StaticImageData[];
  interval?: number;
  title?: string;
  subtitle?: string;
}

interface HorizontalScrollGalleryProps {
  images: StaticImageData[];
}

interface BigFeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
}

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ============================================
// DYNAMIC IMAGE ROTATOR COMPONENT
// ============================================
const DynamicImageRotator = ({
  images,
  interval = 5000,
  title,
  subtitle,
}: ImageRotatorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-3xl overflow-hidden group">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex]}
            alt={`Salon showcase ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Overlay Content */}
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <motion.h3
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold"
          >
            {title}
          </motion.h3>
          {subtitle && (
            <motion.p
              key={`subtitle-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 mt-1"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2 bg-rose-400"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// HORIZONTAL SCROLLING GALLERY
// ============================================
const HorizontalScrollGallery = ({ images }: HorizontalScrollGalleryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-rose-50 dark:hover:bg-rose-900/50"
      >
        <ChevronLeft className="w-5 h-5 text-rose-600" />
      </button>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, y: -5 }}
            className="flex-shrink-0 w-72 md:w-80 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800"
          >
            <div className="relative h-56">
              <Image
                src={img}
                alt={`Gallery ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {idx % 2 === 0 ? "Luxury Hair Styling" : "Signature Treatment"}
              </p>
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {idx % 2 === 0 ? "By Master Stylist" : "Premium Experience"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-rose-50 dark:hover:bg-rose-900/50"
      >
        <ChevronRight className="w-5 h-5 text-rose-600" />
      </button>
    </div>
  );
};

// ============================================
// BIG FEATURE CARD
// ============================================
const BigFeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: BigFeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-6 md:p-8 cursor-pointer group bg-gradient-to-br ${color} shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {title}
        </h3>
        <p className="text-white/80 text-base md:text-lg leading-relaxed">
          {description}
        </p>
        <div className="mt-5 flex items-center gap-2 text-white/90 group-hover:gap-3 transition-all">
          <span className="text-sm font-medium">Explore Now</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// STATS CARD
// ============================================
const StatCard = ({ value, label, icon: Icon }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 text-center border border-rose-100 dark:border-rose-800/30"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/50 dark:to-amber-900/50 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
};

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================
const HomePage = () => {
  // Hero/Slider Images - Replace with your actual imported images
  const heroImages: StaticImageData[] = [hero1, hero2, hero3, hero4];

  // Gallery Images
  const galleryImages: StaticImageData[] = [
    gallery1,
    gallery2,
    gallery3,
    gallery4,
    gallery5,
    gallery6,
  ];

  // Vertical Stylist Images
  const verticalImages: StaticImageData[] = [stylist1, stylist2, stylist3];

  return (
    <div className="space-y-12 pb-12 px-6">
      {/* ============================================
          BIG HEADING & STATS
      ============================================ */}
      <section className="text-left space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-semibold mb-4">
            Welcome to LUME
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 bg-clip-text text-transparent">
            Elevate Your Beauty
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-2xl ">
            Experience luxury hair, nail, and beauty services crafted just for
            you by our expert stylists.
          </p>
        </motion.div>

        {/* ============================================
          HERO SECTION WITH DYNAMIC ROTATOR
      ============================================ */}
        <section className="relative rounded-3xl overflow-hidden">
          <DynamicImageRotator
            images={heroImages}
            interval={6000}
            title="LUME Salon"
            subtitle="Where Beauty Meets Artistry"
          />
          <div className="absolute top-6 left-6 z-10">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
              <p className="text-white text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Award-Winning Salon
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-8 gap-4 max-w-8xl mx-auto">
          <StatCard value="10+" label="Expert Stylists" icon={Scissors} />
          <StatCard value="5★" label="Rating" icon={Star} />
          <StatCard value="2k+" label="Happy Clients" icon={Heart} />
          <StatCard value="15+" label="Years Exp" icon={Award} />
          <StatCard value="50+" label="Services" icon={Sparkles} />
          <StatCard value="100%" label="Satisfaction" icon={Award} />
          <StatCard value="30min" label="Quick Booking" icon={Clock} />
          <StatCard value="4.9★" label="Google Rating" icon={Star} />
        </div>
      </section>

      {/* ============================================
          BIG FEATURE CARDS SECTION
      ============================================ */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Signature Experiences
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Curated services for the modern connoisseur
            </p>
          </div>
          <button className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BigFeatureCard
            icon={Scissors}
            title="Hair Styling"
            description="From classic cuts to avant-garde styles, our master stylists create looks that turn heads."
            color="from-rose-500 to-rose-600"
          />
          <BigFeatureCard
            icon={Sparkles}
            title="Luxury Treatments"
            description="Rejuvenating hair and scalp treatments using premium organic products."
            color="from-amber-500 to-rose-500"
          />
          <BigFeatureCard
            icon={Calendar}
            title="Bridal & Events"
            description="Complete bridal packages including hair, makeup, and styling for your special day."
            color="from-rose-600 to-purple-600"
          />
        </div>
      </section>

      {/* ============================================
          HORIZONTAL SCROLLING GALLERY
      ============================================ */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Our Gallery
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Glimpse into the LUME experience
          </p>
        </div>
        <HorizontalScrollGallery images={galleryImages} />
      </section>

      {/* ============================================
          VERTICAL IMAGES + TEXT SPLIT SECTION
      ============================================ */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 text-xs font-semibold mb-3">
                  BOOK YOUR EXPERIENCE
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                  Define Your{" "}
                  <span className="text-rose-600">Beauty, Glow & Day</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                  Choose from our signature services designed to pamper and
                  rejuvenate you. Book your appointment online or walk in during
                  our open hours.
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Mon-Fri: 10am-5pm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Sat-Sun: By appointment
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 border-2 border-white dark:border-gray-800"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                +6 expert stylists
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {verticalImages.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-2xl overflow-hidden shadow-xl aspect-[3/4]"
            >
              <Image
                src={img}
                alt={`Stylist ${idx + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-medium">
                  {idx === 0
                    ? "Emma Watson"
                    : idx === 1
                      ? "Michael Chen"
                      : "Sophia Rodriguez"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================
          CTA SECTION
      ============================================ */}
      <section className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-amber-600" />
        <div className="relative z-10 py-16 px-6 text-center text-white">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready for Your Transformation?
            </h2>
            <p className="text-white/90 text-lg max-w-lg mx-auto mb-8">
              Book your appointment today and experience the LUME difference.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-rose-600 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Book Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                View Services
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIAL PREVIEW
      ============================================ */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            What Our Clients Say
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Loved by thousands across the city
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Johnson",
              text: "Absolutely incredible experience! The stylist understood exactly what I wanted.",
              rating: 5,
            },
            {
              name: "David Kim",
              text: "Best salon in town. Professional staff and amazing atmosphere. Highly recommend!",
              rating: 5,
            },
            {
              name: "Maria Garcia",
              text: "My go-to salon for all my beauty needs. Always leave feeling like a million bucks.",
              rating: 5,
            },
          ].map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-rose-100 dark:border-rose-800/30"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-rose-500 text-rose-500"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "{testimonial.text}"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Happy Client
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
