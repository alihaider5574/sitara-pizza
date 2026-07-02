/**
 * GSAP ScrollTrigger hero timeline.
 * Call initHeroTimeline(containerRef) after the hero mounts.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initHeroTimeline(container) {
  if (!container) return

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Stagger hero elements on mount
    tl.from('.hero-badge', { opacity: 0, y: 20, duration: 0.5 })
      .from('.hero-title', { opacity: 0, y: 40, duration: 0.7 }, '-=0.2')
      .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.6 }, '-=0.4')
      .from('.hero-cta', { opacity: 0, y: 20, scale: 0.95, stagger: 0.1, duration: 0.5 }, '-=0.3')
      .from('.hero-stats', { opacity: 0, y: 20, stagger: 0.12, duration: 0.5 }, '-=0.2')

    // Parallax on scroll
    gsap.to('.hero-canvas', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Fade out hero on scroll
    gsap.to('.hero-content', {
      opacity: 0,
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: '30% top',
        end: '80% top',
        scrub: true,
      },
    })
  }, container)

  return ctx // caller should ctx.revert() on unmount
}

export function initSectionReveal(sectionEl, itemSelector = '.reveal-item') {
  if (!sectionEl) return

  const ctx = gsap.context(() => {
    gsap.from(itemSelector, {
      opacity: 0,
      y: 50,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  }, sectionEl)

  return ctx
}
