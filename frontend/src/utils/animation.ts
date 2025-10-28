import type { Variants } from 'framer-motion';

// Variants de base
export const fadeInOut: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15
    }
  }
};

export const slideUpInOut = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };
  
  export const slideRightInOut = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };
  
export const scaleInOut: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
};

// Variants pour les modales
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

// Variants pour les menus et dropdowns
export const menuVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -4
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: {
      duration: 0.15
    }
  }
};

// Variants pour les cartes et éléments de liste
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

// Variants pour les transitions de page
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

// Variants pour les notifications toast
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    x: 50,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

// Variants pour les changements de liste
export const listVariants: Variants = {
  initial: {
    opacity: 0,
    height: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    height: 'auto',
    scale: 1,
    transition: {
      height: {
        duration: 0.3
      },
      opacity: {
        duration: 0.2
      }
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    transition: {
      height: {
        duration: 0.3
      },
      opacity: {
        duration: 0.2
      }
    }
  }
};


// Configuration des transitions Spring pour une sensation plus naturelle
export const springConfig = {
  stiff: {
    type: 'spring',
    stiffness: 300,
    damping: 30
  },
  medium: {
    type: 'spring',
    stiffness: 200,
    damping: 25
  },
  gentle: {
    type: 'spring',
    stiffness: 100,
    damping: 20
  }
} as const;

// Configuration des transitions d'assouplissement pour des animations plus contrôlées
export const easingConfig = {
  smooth: [0.32, 0.72, 0, 1],
  snappy: [0.22, 1, 0.36, 1],
  gentle: [0.25, 0.1, 0.25, 1]
} as const;

// Durées standard pour la cohérence des animations
export const durations = {
  fast: 0.15,
  normal: 0.2,
  medium: 0.3,
  slow: 0.4
} as const;