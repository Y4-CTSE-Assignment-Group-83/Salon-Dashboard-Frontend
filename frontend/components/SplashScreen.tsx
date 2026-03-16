"use client";

import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import SplashBG from "../assets/common/SplashBG.png";
import gemAnimation from "@/public/lottie/salon.json";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

export default function SplashScreen() {
  const [readyToRedirect, setReadyToRedirect] = useState(false);

  const SPLASH_DURATION = 8500;

  const loadingMessages = [
    "Preparing your salon experience...",
    "Almost there...",
    "Welcome to LUME Salon!",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useAuthRedirect({ shouldRedirect: readyToRedirect });

  useEffect(() => {
    // Rotate loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev,
      );
    }, 3600);

    // Main splash timer
    const timer = setTimeout(() => {
      setReadyToRedirect(true);
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(timer);
      clearInterval(messageInterval);
    };
  }, [loadingMessages.length]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={SplashBG}
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-4 mt-4">
        {/* Lottie Animation as Brand Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sm:w-54 sm:h-54 w-40 h-40 sm:-mt-14 -mt-24 relative"
        >
          <Lottie
            animationData={gemAnimation}
            loop={true}
            className="w-full h-full"
          />
        </motion.div>

        {/* Branding text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          className="mt-6 flex flex-col items-center relative"
        >
          {/* Subtle shadow background that fades */}
          <motion.div
            initial={{
              opacity: 0.3,
              scale: 1.2,
              filter: "blur(20px)",
            }}
            animate={{
              opacity: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            transition={{
              delay: 0.8,
              duration: 1.2,
              ease: "easeOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-rose-900/40 to-amber-400/40 rounded-lg"
          />

          {/* Main Title */}
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.8,
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative text-4xl sm:text-6xl font-light text-center uppercase mb-2"
          >
            <span className="relative inline-block">
              {/* Shadow text for depth */}
              <span className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-amber-600/20 blur-xl" />

              {/* Main text with LUME and Salon together */}
              <span className="relative flex flex-col items-center sm:flex-row sm:items-baseline sm:gap-3">
                {/* LUME - Large and bold */}
                <span
                  className="block font-black tracking-tight bg-gradient-to-br
          from-rose-900 via-rose-700 to-amber-700
          dark:from-rose-300 dark:via-rose-200 dark:to-amber-200
          bg-clip-text text-transparent text-5xl sm:text-7xl
          leading-none mb-2 sm:mb-0"
                >
                  LUME
                </span>

                {/* Salon - Elegant and positioned normally */}
                <span
                  className="block text-2xl sm:text-4xl font-light tracking-[0.2em]
          bg-gradient-to-r from-amber-600 to-rose-600
          dark:from-amber-400 dark:to-rose-400
          bg-clip-text text-transparent
          leading-none"
                >
                  Salon
                </span>
              </span>
            </span>

            {/* Minimal dot decoration - repositioned */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, duration: 0.4, type: "spring" }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2
        w-1.5 h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
            />
          </motion.h1>

          {/* Tagline - "Where Beauty Begins" */}
          <motion.p
            initial={{
              opacity: 0,
              y: 8,
              filter: "blur(8px) saturate(0.5)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px) saturate(1)",
            }}
            transition={{
              delay: 1.2,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="mt-8 text-md sm:text-base font-medium tracking-widest
      text-rose-700 uppercase"
          >
            Where Beauty Begins
          </motion.p>

          {/* Slogan */}
          <motion.p
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.4,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="mt-3 text-sm sm:text-base italic text-gray-600 text-center max-w-xs"
          >
            &#34;Enhance Your Natural Beauty&#34;
          </motion.p>
        </motion.div>

        {/* Loading Section - Text only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-12"
        >
          <div className="flex items-center justify-center w-full">
            {/* Loading Text with animation */}
            <div className={`${inter.className} text-center`}>
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-rose-600"
              >
                {loadingMessages[currentMessageIndex]}
              </motion.div>

              {/* Simple loading dots animation */}
              <div className="flex justify-center gap-1 mt-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-1.5 h-1.5 rounded-full bg-rose-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-rose-500"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-amber-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
