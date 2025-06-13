import { Variants } from "framer-motion";

// Common page section animations with staggered children
export const sectionAnimationVariants: {
  container: Variants;
  item: Variants;
} = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      scale: 0.9,
      filter: "blur(8px)",
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  },
};

// Faster animation for contact page and less intense sections
export const contactAnimationVariants: {
  container: Variants;
  item: Variants;
} = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)",
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  },
};

// Card hover animations
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.2,
      type: "tween",
      ease: "easeIn"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      type: "tween",
      ease: "easeOut"
    }
  }
};

// Fade in from bottom animation
export const fadeInFromBottom: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Slide in from left animation
export const slideInFromLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Slide in from right animation  
export const slideInFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}; 