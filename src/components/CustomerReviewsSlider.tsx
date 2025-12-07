import { useEffect, useRef, useState } from 'react';
import customerReviewsData from '../data/customer-reviews.json';

interface CustomerReview {
  video_id: string;
  ign: string;
  followers: string;
  image: string;
  description: string;
}

// Wistia Player Component
const WistiaPlayer = ({
  mediaId,
  aspect = '0.5660377358490566',
  className = '',
}: {
  mediaId: string;
  aspect?: string;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear existing content
      containerRef.current.innerHTML = '';

      // Create and append Wistia player element
      const player = document.createElement('wistia-player');
      player.setAttribute('media-id', mediaId);
      player.setAttribute('aspect', aspect);
      containerRef.current.appendChild(player);
    }
  }, [mediaId, aspect]);

  return <div ref={containerRef} className={className} />;
};

const CustomerReviewsSlider = () => {
  const reviews = customerReviewsData as CustomerReview[];
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const isDraggingRef = useRef(false);
  const initialMouseX = useRef(0);
  const initialMouseY = useRef(0);
  const hasExceededThreshold = useRef(false);
  const isScrollingRef = useRef(false);
  const CLICK_THRESHOLD = 8; // pixels

  // Load Wistia player script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const cards = slider.querySelectorAll(
      '.video-review-card',
    ) as NodeListOf<HTMLElement>;
    if (!cards.length) return;

    const cardsPerView = isMobile ? 1 : 4;
    const gap = 15;
    const cardWidth = cards[0].offsetWidth + gap;

    // Set flag to prevent handleScroll from updating index during programmatic scroll
    isScrollingRef.current = true;

    if (isMobile) {
      // On mobile, scroll to the exact card position
      const maxScrollLeft = slider.scrollWidth - slider.offsetWidth;
      const targetScroll = Math.min(currentIndex * cardWidth, maxScrollLeft);
      slider.scrollTo({ left: targetScroll, behavior: 'smooth' });
    } else {
      const maxIndex = Math.max(0, cards.length - cardsPerView);
      const index = Math.min(currentIndex, maxIndex);
      // Calculate scroll position to show the card at the start
      const scrollPosition = index * cardWidth;
      slider.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }

    // Reset flag after scroll animation completes
    const timeout = setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentIndex, isMobile]);

  const handlePrev = () => {
    const cardsPerView = isMobile ? 1 : 4;
    if (currentIndex > 0) {
      setCurrentIndex((prev) => Math.max(0, prev - cardsPerView));
    }
  };

  const handleNext = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cards = slider.querySelectorAll(
      '.video-review-card',
    ) as NodeListOf<HTMLElement>;
    const cardsPerView = isMobile ? 1 : 4;
    const maxIndex = Math.max(0, cards.length - cardsPerView);
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + cardsPerView));
    }
  };

  const handleScroll = () => {
    // Don't update index if we're programmatically scrolling
    if (isScrollingRef.current) return;

    const slider = sliderRef.current;
    if (!slider) return;
    const cards = slider.querySelectorAll(
      '.video-review-card',
    ) as NodeListOf<HTMLElement>;
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth + 15;

    if (isMobile) {
      const sliderCenter = slider.scrollLeft + slider.offsetWidth / 2;
      let nearestIndex = 0;
      let minDistance = Infinity;
      cards.forEach((card, idx) => {
        const cardCenter =
          (card as HTMLElement).offsetLeft +
          (card as HTMLElement).offsetWidth / 2;
        const distance = Math.abs(sliderCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = idx;
        }
      });
      setCurrentIndex(nearestIndex);
    } else {
      const newIndex = Math.round(slider.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Drag functionality with click threshold
  const handleMouseDown = (e: React.MouseEvent) => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Stop any existing drag first
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      slider.style.cursor = 'grab';
      slider.style.userSelect = 'auto';
    }

    // Store initial mouse position for threshold check
    initialMouseX.current = e.pageX;
    initialMouseY.current = e.pageY;
    hasExceededThreshold.current = false;

    dragStartX.current = e.pageX - slider.offsetLeft;
    dragScrollLeft.current = slider.scrollLeft;

    // Prevent default immediately to stop any video drag behavior
    e.preventDefault();

    // Helper to disable video interactions
    const disableVideoInteractions = () => {
      const videos = slider.querySelectorAll('wistia-player, video, iframe');
      videos.forEach((video) => {
        (video as HTMLElement).style.pointerEvents = 'none';
        (video as HTMLElement).setAttribute('draggable', 'false');
      });
    };

    // Helper to enable video interactions
    const enableVideoInteractions = () => {
      const videos = slider.querySelectorAll('wistia-player, video, iframe');
      videos.forEach((video) => {
        (video as HTMLElement).style.pointerEvents = 'auto';
        (video as HTMLElement).removeAttribute('draggable');
      });
    };

    // Create handlers that will be removed
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Check if we've exceeded the click threshold
      if (!hasExceededThreshold.current) {
        const deltaX = Math.abs(e.pageX - initialMouseX.current);
        const deltaY = Math.abs(e.pageY - initialMouseY.current);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < CLICK_THRESHOLD) {
          // Still within threshold, don't start dragging
          return;
        }

        // Threshold exceeded, start dragging
        hasExceededThreshold.current = true;
        isDraggingRef.current = true;
        const slider = sliderRef.current;
        if (slider) {
          slider.style.cursor = 'grabbing';
          slider.style.userSelect = 'none';
          // Disable video interactions when dragging starts
          disableVideoInteractions();
        }
        // Prevent default immediately when dragging starts
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Only drag if we've exceeded threshold
      if (!isDraggingRef.current || !hasExceededThreshold.current) {
        return;
      }

      const slider = sliderRef.current;
      if (!slider) {
        isDraggingRef.current = false;
        hasExceededThreshold.current = false;
        enableVideoInteractions();
        return;
      }

      // Prevent default to stop video interactions
      e.preventDefault();
      e.stopPropagation();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - dragStartX.current) * 1.5;
      slider.scrollLeft = dragScrollLeft.current - walk;
    };

    const handleGlobalMouseUp = () => {
      // Re-enable video interactions
      enableVideoInteractions();

      // If we never exceeded threshold, it was just a click - allow normal behavior
      if (!hasExceededThreshold.current) {
        // Reset everything, allow normal click behavior
        isDraggingRef.current = false;
        hasExceededThreshold.current = false;
        const slider = sliderRef.current;
        if (slider) {
          slider.style.cursor = 'grab';
          slider.style.userSelect = 'auto';
        }
      } else {
        // We were dragging, stop it
        isDraggingRef.current = false;
        hasExceededThreshold.current = false;
        const slider = sliderRef.current;
        if (slider) {
          slider.style.cursor = 'grab';
          slider.style.userSelect = 'auto';
        }
      }

      // Remove listeners using the exact same function references
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };

    // Add listeners
    document.addEventListener('mousemove', handleGlobalMouseMove, {
      passive: false,
    });
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseUp);
  };

  // Cleanup on unmount - ensure no listeners remain
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
      const slider = sliderRef.current;
      if (slider) {
        slider.style.cursor = 'grab';
        slider.style.userSelect = 'auto';
      }
    };
  }, []);

  // Touch handlers for mobile
  const touchStartX = useRef(0);
  const touchScrollLeft = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const slider = sliderRef.current;
    if (!slider) return;
    touchStartX.current = e.touches[0].pageX - slider.offsetLeft;
    touchScrollLeft.current = slider.scrollLeft;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const slider = sliderRef.current;
    if (!slider) return;
    const x = e.touches[0].pageX - slider.offsetLeft;
    const walk = (x - touchStartX.current) * 1.5;
    slider.scrollLeft = touchScrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const cardsPerView = isMobile ? 1 : 4;
  const shouldShowNavigation = reviews.length > cardsPerView;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < reviews.length - cardsPerView;

  return (
    <section className="bg-bgPrimary text-textPrimary relative mx-auto py-8 lg:py-18">
      <div className="relative mx-auto max-w-[1450px]">
        <div className="customers-container">
          <h2 className="video-reviews-heading flex justify-center gap-4">
            <span className="text-gradient">Results Goes on and</span>
            <span className="mask-right"> onnnnnn</span>
          </h2>
        </div>

        {/* Arrows - outside customers-container to avoid overflow clipping */}
        {shouldShowNavigation && (
          <>
            <button
              className={`slider-arrow slider-arrow-prev ${!canGoPrev ? 'disabled' : ''}`}
              onClick={handlePrev}
              disabled={!canGoPrev}
              aria-label="Previous review"
            >
              <div className="arrow-icon"></div>
            </button>
            <button
              className={`slider-arrow slider-arrow-next ${!canGoNext ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Next review"
            >
              <div className="arrow-icon"></div>
            </button>
          </>
        )}

        <div className="customers-container relative">
          {/* Masks */}
          <div
            className={`slider-mask slider-mask-left ${canGoPrev ? 'slider-mask-visible' : ''}`}
          ></div>
          <div
            className={`slider-mask slider-mask-right ${canGoNext ? 'slider-mask-visible' : ''}`}
          ></div>

          <div
            className="video-reviews-slider cursor-grab"
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {reviews.map((review, index) => (
              <div
                key={index}
                className="video-review-card rounded-xl bg-white/5"
                data-index={index}
              >
                <div
                  className="relative w-full cursor-pointer overflow-hidden rounded-t-xl"
                  onDragStart={(e) => e.preventDefault()}
                  draggable={false}
                >
                  <WistiaPlayer
                    mediaId={review.video_id}
                    aspect="0.6"
                    className="h-full w-full"
                  />
                </div>
                <div className="flex flex-col gap-4 p-4">
                  <div className="info-head flex flex-row items-center gap-4 rounded-lg bg-white/10 p-3 md:p-4">
                    <img
                      src={review.image}
                      alt={review.ign}
                      className="h-8 w-8 rounded-full object-cover text-[10px] md:h-12 md:w-12"
                    />
                    <div className="flex flex-col">
                      <div className="text-textPrimary font-semibold">
                        {review.ign}
                      </div>
                      <div className="text-sm text-white/70">
                        {review.followers}
                      </div>
                    </div>
                  </div>
                  {review.description && (
                    <div className="text-white/80 italic">
                      &ldquo;{review.description}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {shouldShowNavigation && reviews.length > 2 && (
            <div className="slider-navigation mt-5 flex items-center justify-center gap-2.5">
              <div className="flex items-center justify-center gap-2.5">
                <button
                  className={`bullets-arrow bullets-arrow-prev ${!canGoPrev ? 'disabled' : ''}`}
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  aria-label="Previous"
                >
                  <div className="arrow-icon-small"></div>
                </button>
                <div className="flex min-w-[120px] items-center justify-center gap-2">
                  {Array.from({
                    length: isMobile
                      ? reviews.length
                      : Math.ceil(reviews.length / cardsPerView),
                  }).map((_, i) => {
                    const activeBullet = isMobile
                      ? currentIndex
                      : Math.floor(currentIndex / cardsPerView);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`slider-bullet ${i === activeBullet ? 'slider-bullet-active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isMobile) {
                            // On mobile, each bullet = one card
                            setCurrentIndex(i);
                          } else {
                            // On desktop, each bullet = one page (4 cards)
                            const targetIndex = i * cardsPerView;
                            const slider = sliderRef.current;
                            if (slider) {
                              const cards = slider.querySelectorAll(
                                '.video-review-card',
                              ) as NodeListOf<HTMLElement>;
                              if (cards.length > 0) {
                                const maxIndex = Math.max(
                                  0,
                                  cards.length - cardsPerView,
                                );
                                setCurrentIndex(
                                  Math.min(targetIndex, maxIndex),
                                );
                              } else {
                                setCurrentIndex(targetIndex);
                              }
                            } else {
                              setCurrentIndex(targetIndex);
                            }
                          }
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                      ></button>
                    );
                  })}
                </div>
                <button
                  className={`bullets-arrow bullets-arrow-next ${!canGoNext ? 'disabled' : ''}`}
                  onClick={handleNext}
                  disabled={!canGoNext}
                  aria-label="Next"
                >
                  <div className="arrow-icon-small"></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewsSlider;
