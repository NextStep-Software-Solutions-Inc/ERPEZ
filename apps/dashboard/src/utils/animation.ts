import { useEffect, useState } from 'react'
import type { Variants } from 'framer-motion'

/**
 * Animation Design System Configuration
 *
 * Standardized animation timings, easing functions, and variants for consistent
 * motion throughout the application. Extended from base animation utilities for
 * use across all features (Master KPI, Success Indicator, etc.)
 */

/**
 * Animation Timing Standards (in seconds)
 */
export const animationTimings = {
  entrance: {
    quick: 0.2,
    normal: 0.3,
    slow: 0.4,
  },
  exit: {
    quick: 0.15,
    normal: 0.2,
  },
  interactive: {
    instant: 0.1,
    normal: 0.15,
    smooth: 0.2,
  },
  stagger: {
    tight: 0.05,
    normal: 0.08,
    loose: 0.12,
    delay: 0.1,
  },
  loading: {
    pulse: 1.5,
    spin: 2.0,
    float: 3.0,
  },
} as const

/**
 * Spring Physics Presets
 */
export const springPhysics = {
  stiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
  normal: { type: 'spring' as const, stiffness: 300, damping: 24 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 20 },
} as const

/**
 * Page/Container Level Animations
 */
export const pageAnimations = {
  pageEnter: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: animationTimings.entrance.quick,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  containerStagger: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: animationTimings.stagger.normal,
        delayChildren: animationTimings.stagger.delay,
      },
    },
  } as Variants,

  containerTightStagger: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: animationTimings.stagger.tight,
        delayChildren: animationTimings.stagger.delay,
      },
    },
  } as Variants,
} as const

/**
 * Item Level Animations
 */
export const itemAnimations = {
  slideUpFade: {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: animationTimings.entrance.normal,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: {
        duration: animationTimings.exit.normal,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  scaleFade: {
    hidden: { opacity: 0, scale: 0.98 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: animationTimings.entrance.normal,
        ...springPhysics.normal,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: animationTimings.exit.normal,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  pop: {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: animationTimings.entrance.quick,
        ...springPhysics.stiff,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.6,
      transition: {
        duration: animationTimings.exit.quick,
      },
    },
  } as Variants,
} as const

/**
 * Interactive/Hover Animations
 */
export const interactionAnimations = {
  cardLift: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
    },
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: animationTimings.interactive.normal,
        ...springPhysics.normal,
      },
    },
  } as Variants,

  scaleHover: {
    rest: { scale: 1 },
    hover: {
      scale: 1.01,
      transition: {
        duration: animationTimings.interactive.smooth,
        ...springPhysics.normal,
      },
    },
  } as Variants,

  buttonPress: {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: animationTimings.interactive.instant,
        ...springPhysics.stiff,
      },
    },
    tap: {
      scale: 0.98,
    },
  } as Variants,
} as const

/**
 * Tab/Navigation Animations
 */
export const tabAnimations = {
  // Trigger hover effects with smooth scaling
  triggerHover: {
    rest: { scale: 1, opacity: 1 },
    hover: {
      scale: 1.02,
      transition: {
        duration: animationTimings.interactive.normal,
        ...springPhysics.normal,
      },
    },
    focus: {
      scale: 1.01,
      transition: {
        duration: animationTimings.interactive.smooth,
      },
    },
  } as Variants,

  // Direction-aware slide transition for tab content
  contentSlide: {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: animationTimings.entrance.normal,
        ease: 'easeOut' as const,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
      transition: {
        duration: animationTimings.exit.normal,
        ease: 'easeOut' as const,
      },
    }),
  } as Variants,

  // Fade transition for tab content (smoother alternative)
  contentFade: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: animationTimings.entrance.quick,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: animationTimings.exit.quick,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  // Loading state for lazy-loaded tab content
  contentLoading: {
    hidden: { opacity: 0, y: 4 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: animationTimings.entrance.normal,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  // Scale and expand animation for underline tab style
  underlineExpand: {
    rest: { scaleX: 0 },
    active: {
      scaleX: 1,
      transition: {
        duration: animationTimings.interactive.smooth,
        ease: 'easeInOut' as const,
      },
    },
  } as Variants,

  // Stagger animation for multiple tabs
  tabListStagger: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: animationTimings.stagger.tight,
        delayChildren: animationTimings.stagger.delay,
      },
    },
  } as Variants,

  // Individual tab trigger in list
  tabTrigger: {
    hidden: { opacity: 0, x: -10 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: animationTimings.entrance.quick,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,
} as const

/**
 * Loading State Animations
 */
export const loadingAnimations = {
  skeletonPulse: {
    animate: {
      opacity: [0.6, 1, 0.6],
    },
    transition: {
      duration: animationTimings.loading.pulse,
      ease: 'easeInOut' as const,
      repeat: Infinity,
    },
  } as Variants,

  spin: {
    animate: {
      rotate: 360,
    },
    transition: {
      duration: animationTimings.loading.spin,
      ease: 'linear' as const,
      repeat: Infinity,
    },
  } as Variants,

  float: {
    animate: {
      y: [0, 6, 0],
    },
    transition: {
      duration: animationTimings.loading.float,
      ease: 'easeInOut' as const,
      repeat: Infinity,
    },
  } as Variants,
} as const

/**
 * Rating Scale Template Animations
 * Custom animations for template selection, detail panel, and sidebar interactions
 */
export const templateAnimations = {
  // Detail panel cross-fade with staggered children (300ms)
  detailPanelStagger: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0,
      },
    },
  } as Variants,

  // Detail panel sections with custom delays
  detailPanelSection: {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  // Template item selection animation (scale 1.0 → 1.1, 300ms)
  templateItemSelected: {
    rest: {
      scale: 1,
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
    },
    selected: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  // Template item hover/tap animations
  templateItemInteraction: {
    rest: { scale: 1 },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        duration: animationTimings.interactive.normal,
        ...springPhysics.normal,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: animationTimings.interactive.instant,
      },
    },
  } as Variants,

  // Sidebar load with 200ms initial delay + 120ms stagger between items
  sidebarLoadStagger: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: 0.2, // 200ms initial delay
        staggerChildren: 0.12, // 120ms between items
      },
    },
  } as Variants,

  // Tab content slide with direction-aware movement (400ms)
  tabContentSlideSmooth: {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    }),
  } as Variants,

  // Template item entrance/exit for search filter (400ms)
  templateItemFilterAnimation: {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,
} as const

/**
 * Content Loading Fade Animations (300ms)
 * Used for fading out content when loading starts and fading in new content
 */
export const contentLoadAnimations = {
  // Fade out container for existing content
  fadeOut: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  // Individual card/row fade animations for loading state
  cardLoadFade: {
    hidden: { opacity: 0, y: 4 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: -4,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  } as Variants,

  // Stagger container for loading in multiple items
  loadStagger: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0,
      },
    },
  } as Variants,
} as const

/**
 * Legacy variant exports for backwards compatibility
 */
export const containerVariants = pageAnimations.containerStagger
export const itemVariants = itemAnimations.slideUpFade
export const cardVariants = itemAnimations.scaleFade
export const cardHoverVariants = interactionAnimations.cardLift
export const subKpiHoverVariants = interactionAnimations.scaleHover

// Hook to detect reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}
