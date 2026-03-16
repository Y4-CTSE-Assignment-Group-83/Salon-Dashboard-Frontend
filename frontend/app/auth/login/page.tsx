"use client";

import { Suspense } from "react";
import LoginForm from "@/components/loginForm/LoginForm";
import { motion } from "framer-motion";

export default function Page() {
  // Loader animation using Framer Motion
  const loader = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-screen bg-gray-100"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"
      />
    </motion.div>
  );

  return (
    <Suspense fallback={loader}>
      {<LoginForm />}
    </Suspense>
  );
}
