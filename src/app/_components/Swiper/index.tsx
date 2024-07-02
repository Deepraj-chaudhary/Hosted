import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Media } from '../../../payload/payload-types'
import { Media as MediaComponent } from '../Media'

import classes from './index.module.scss' // Assuming a separate CSS module for swiper styles

interface SwiperProps {
  mediaItems: (string | Media)[]
}

const Swiper: React.FC<SwiperProps> = ({ mediaItems }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 500) // Match with the CSS transition duration
  }

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % mediaItems.length)
  }, [currentSlide, mediaItems.length])

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + mediaItems.length) % mediaItems.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const deltaX = touchStartX.current - touchEndX.current
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          nextSlide()
        } else {
          prevSlide()
        }
      }
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000) // Auto slide every 5 seconds
    return () => clearInterval(interval)
  }, [currentSlide, nextSlide])

  return (
    <div
      className={classes.swiper}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={classes.swiperWrapper}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className={`${classes.slide} ${index === currentSlide ? classes.activeSlide : ''} ${
              isTransitioning ? classes.transitioning : ''
            }`}
          >
            <MediaComponent resource={item} />
          </div>
        ))}
      </div>
      <button className={classes.prevButton} onClick={prevSlide}>
        ❮
      </button>
      <button className={classes.nextButton} onClick={nextSlide}>
        ❯
      </button>
      <div className={classes.dots}>
        {mediaItems.map((_, index) => (
          <span
            key={index}
            className={`${classes.dot} ${index === currentSlide ? classes.activeDot : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default Swiper
