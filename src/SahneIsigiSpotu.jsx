import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Fareyi yumuşak bir gecikmeyle takip eden brass tonlu bir ışık huzmesi.
// Karanlık bir pratik odasında elinde ışıkla geziniyormuş hissi veriyor.
// Sadece masaüstünde (fare olan cihazlarda) görünüyor.
const SahneIsigiSpotu = () => {
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const x = useSpring(mouseX, { damping: 28, stiffness: 180 });
  const y = useSpring(mouseY, { damping: 28, stiffness: 180 });

  useEffect(() => {
    const hareketEtti = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', hareketEtti);
    return () => window.removeEventListener('mousemove', hareketEtti);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-[550px] h-[550px] rounded-full pointer-events-none z-[1] hidden md:block"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        background: 'radial-gradient(circle, rgba(79, 209, 197, 0.07), transparent 70%)'
      }}
      aria-hidden="true"
    />
  );
};

export default SahneIsigiSpotu;