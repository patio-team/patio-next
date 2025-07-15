'use client';

import { motion, Variants } from 'motion/react';

export function LoadingSpinner() {
  const dotVariants: Variants = {
    jump: {
      y: -20,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="flex items-center justify-center space-x-2">
      <motion.div
        className="h-4 w-4 rounded-full bg-[#3FE3D2] opacity-50 will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="h-4 w-4 rounded-full bg-[#98DDAB] opacity-75 will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="h-4 w-4 rounded-full bg-[#FFC952] will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="h-4 w-4 rounded-full bg-[#FF7473] opacity-75 will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="h-4 w-4 rounded-full bg-[#FE346E] opacity-50 will-change-transform"
        variants={dotVariants}
      />
    </motion.div>
  );
}
