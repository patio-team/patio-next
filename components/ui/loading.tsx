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
        className="w-4 h-4 bg-[#3FE3D2] opacity-50 rounded-full will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="w-4 h-4 bg-[#98DDAB] opacity-75 rounded-full will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="w-4 h-4 bg-[#FFC952] rounded-full will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="w-4 h-4 bg-[#FF7473] opacity-75 rounded-full will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="w-4 h-4 bg-[#FE346E] opacity-50 rounded-full will-change-transform"
        variants={dotVariants}
      />
    </motion.div>
  );
}
