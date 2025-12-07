import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Announcement from '../../components/Announcement';
import Header from '../../components/Header';
import Stars from '../../components/Stars';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import image1 from '../../assets/1.png';
import image2 from '../../assets/2.png';
import image3 from '../../assets/3.png';
import image4 from '../../assets/4.png';
import image5 from '../../assets/5.png';
import video from '../../assets/Phone.mp4';
import videoBg from '../../assets/Phone Bg.svg';
import logo from '../../assets/Logo.png';
import Screenshots from '../../components/Screenshots';
import CustomerReviewsSlider from '../../components/CustomerReviewsSlider';

const Home = () => {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isExitingStickyHeader, setIsExitingStickyHeader] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const mobileButtonsRef = useRef<HTMLDivElement>(null);

  // Fallback in case the onLoadedData never fires
  useEffect(() => {
    const timeout = setTimeout(() => setVideoLoaded(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Intersection Observer for sticky header
  useEffect(() => {
    const getElementToObserve = () => {
      // Check screen size (sm breakpoint is 640px)
      const isMobile = window.innerWidth < 640;

      if (isMobile) {
        // Mobile: observe mobile buttons only
        return mobileButtonsRef.current;
      } else {
        // Desktop: observe Header only
        return headerRef.current;
      }
    };

    const elementToObserve = getElementToObserve();
    if (!elementToObserve) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When element is not intersecting (scrolled out of view), show sticky header
          setShowStickyHeader(!entry.isIntersecting);
        });
      },
      {
        threshold: 0,
        rootMargin: '0px',
      },
    );

    observer.observe(elementToObserve);

    // Handle resize to switch between desktop/mobile observers
    const handleResize = () => {
      observer.disconnect();
      const newElement = getElementToObserve();
      if (newElement) {
        observer.observe(newElement);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStickyHeaderLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (showStickyHeader && !isExitingStickyHeader) {
      e.preventDefault();
      setIsExitingStickyHeader(true);
      setShowStickyHeader(false);

      // Wait for exit animation to complete before navigating
      setTimeout(() => {
        navigate(path);
        setIsExitingStickyHeader(false);
      }, 600); // Match animation duration
    }
  };

  return (
    <>
      {/* Sticky Header - appears when Header scrolls out of view */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="header--border fixed right-0 left-0 z-18 w-full"
            style={{ top: '28px' }} // Position below Announcement (approx height)
          >
            <div className="mask pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(170deg,rgba(255,155,165,0.6)_0%,rgba(134,44,53,0.6)_35%)] p-[1px]"></div>

            <div className="relative z-10 container mx-auto flex items-center justify-between py-4">
              {/* Logo */}
              <Link
                to="/"
                className="flex-shrink-0"
                onClick={(e) => {
                  if (showStickyHeader && !isExitingStickyHeader) {
                    e.preventDefault();
                    setIsExitingStickyHeader(true);
                    setShowStickyHeader(false);
                    setTimeout(() => {
                      navigate('/');
                      setIsExitingStickyHeader(false);
                    }, 600);
                  }
                }}
              >
                <img
                  src={logo}
                  alt="logo"
                  className="block h-auto w-24 md:w-32"
                  draggable={false}
                />
              </Link>

              {/* Buttons */}
              <div className="flex items-center gap-3 md:gap-5">
                {/* Book Consultation - hidden on mobile */}
                <div className="hidden sm:block">
                  <a
                    href="/book-consultation"
                    className="outline-btn pointer-events-auto text-[12px] font-bold sm:text-[16px] lg:text-[13px] xl:text-[16px]"
                    onClick={(e) =>
                      handleStickyHeaderLinkClick(e, '/book-consultation')
                    }
                  >
                    BOOK A CONSULTATION
                  </a>
                </div>
                {/* Start Now - visible on all screens */}
                <a
                  href="/getting-started"
                  className="button-gradient bulk-btn pointer-events-auto text-[12px] font-bold sm:text-[16px] lg:text-[13px] xl:text-[16px]"
                  onClick={(e) =>
                    handleStickyHeaderLinkClick(e, '/getting-started')
                  }
                >
                  START NOW
                </a>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <section className="relative min-h-screen">
        <div className="bg-accentPrimary pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full opacity-10 blur-[140px]" />
        <div className="bg-accentPrimary pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-10 blur-[140px]" />

        {/* fade UP on exit / DOWN on enter */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          exit={{ opacity: 0, y: -40, transition: { duration: 0.6 } }}
        >
          <Announcement>
            Only{' '}
            <span className="text-accentPrimary text-shadow-accentPrimary">
              3
            </span>{' '}
            spot is available this month
          </Announcement>
        </motion.div>

        <motion.div
          className="home-container z-1 flex h-full min-h-screen flex-col justify-between gap-4 pb-25 lg:flex-row"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          exit={{ opacity: 0, y: 40, transition: { duration: 0.6 } }}
        >
          {/* Left Side */}
          <div className="relative w-full pt-13 sm:pt-20 lg:w-[55%] 2xl:w-[50.5%]">
            <div className="mb-8 block md:hidden">
              <Logo />
            </div>
            <div ref={headerRef}>
              <Header />
            </div>

            <div className="bg-bgPrimary relative mt-0 inline-flex items-center rounded-full px-4 py-2 sm:mt-38 sm:px-8">
              <div className="animate-gradientMove via-accentPrimary absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-transparent bg-[length:60%_60%] p-[1px]">
                <div className="bg-bgPrimary h-full w-full rounded-full"></div>
              </div>

              <div className="relative flex items-center gap-2 text-[11.5px] text-white sm:text-sm">
                <Stars />
                <span>4.7/5.0 Rating Based on 68 Reviews</span>
              </div>
            </div>

            <h1 className="h1 mt-6 leading-snug text-balance sm:mt-8">
              We Generated +900M In Sales For +200 Ecom Brands
            </h1>

            <p className="mt-5 text-[12px] font-normal text-white opacity-70 sm:mt-7 sm:text-lg lg:text-base">
              We scale e-commerce brands not only through ads, but by analyzing
              the business thoroughly to identify all the gaps that are
              hindering the business growth. So, a mix of performance marketing,
              business consulting, and ads we get your brand to be the next big
              thing in your market
            </p>

            <div ref={mobileButtonsRef} className="mt-6 flex gap-4 sm:hidden">
              <Button
                text="BOOK A CONSULTATION"
                link="/book-consultation"
                type="outline"
              />
              <Button text="START NOW" link="/getting-started" type="bulk" />
            </div>

            {/* Auto-Rotate */}
            <div className="relative mt-10 h-14 sm:mt-42 sm:h-22">
              <span className="bg-bgPrimary absolute top-0 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2 px-3 text-[12px] whitespace-nowrap text-white sm:text-base">
                WE WORK ONLY WITH THE BEST
              </span>
              <div className="mask-fade relative flex h-full w-full items-center overflow-hidden border-t border-b border-white">
                <div className="marquee flex shrink-0">
                  {[1, 2].map((setIndex) => (
                    <div
                      key={setIndex}
                      className="flex h-full w-max shrink-0 items-center [&>img]:mr-16 [&>img]:h-4 [&>img]:sm:h-7"
                    >
                      {[image1, image2, image3, image4, image5].map(
                        (image, i) => (
                          <img key={i} src={image} alt="pic" />
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Video */}
          <div className="relative z-0 mx-auto mt-8 flex aspect-[1/2] w-7/10 items-center justify-center sm:mt-28 md:w-7/10 lg:mt-28 lg:mr-10 lg:ml-10 lg:w-[350px] xl:mr-30 xl:w-[410px] 2xl:mr-38 2xl:w-[470px]">
            {/* Loading Overlay */}
            <motion.div
              className="bg-bgPrimary video-clip absolute inset-0 flex items-center justify-center rounded-md"
              animate={{
                opacity: videoLoaded ? 0 : 1,
                scale: videoLoaded ? 0.98 : 1,
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {!videoLoaded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="border-t-accentPrimary h-8 w-8 rounded-full border-2 border-white/30"
                />
              )}
            </motion.div>

            <motion.video
              className="video-clip z-[1] block h-auto w-full object-cover"
              src={video}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: videoLoaded ? 1 : 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            <img
              src={videoBg}
              className="pointer-events-none absolute top-1/2 left-1/2 -z-5 -translate-x-1/2 -translate-y-1/2 scale-[2.45]"
              alt=""
            />
          </div>
        </motion.div>
      </section>

      <CustomerReviewsSlider />

      <Screenshots />
    </>
  );
};

export default Home;
