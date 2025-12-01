"use client";

import { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMaximize2,
} from "react-icons/fi";

interface MarinaImage {
  id: number;
  url: string;
  title: string;
  isPrimary: boolean;
}

interface ImageCarouselProps {
  images: MarinaImage[];
  marinaName: string;
}

export default function ImageCarousel({
  images,
  marinaName,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    const handleArrowLeft = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        previousImage();
      }
    };

    const handleArrowRight = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("keydown", handleArrowLeft);
    window.addEventListener("keydown", handleArrowRight);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("keydown", handleArrowLeft);
      window.removeEventListener("keydown", handleArrowRight);
    };
  }, [isFullscreen, currentIndex]);

  const previousImage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const nextImage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToImage = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-2">🏴</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Carousel */}
      <div className="relative w-full mb-8">
        {/* Main Image */}
        <div className="relative h-[500px] rounded-xl overflow-hidden bg-gray-900 group">
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].title || marinaName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                aria-label="Previous image"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                aria-label="Next image"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            aria-label="View fullscreen"
          >
            <FiMaximize2 className="w-5 h-5" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Image Title */}
          {images[currentIndex].title && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium">
                {images[currentIndex].title}
              </p>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? "ring-4 ring-ocean-600 scale-105"
                    : "ring-2 ring-gray-200 hover:ring-ocean-400 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title || `${marinaName} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                    Main
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-50"
            aria-label="Close fullscreen"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-50"
                aria-label="Previous image"
              >
                <FiChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-50"
                aria-label="Next image"
              >
                <FiChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium z-50">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-16">
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].title || marinaName}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          {/* Image Title */}
          {images[currentIndex].title && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 text-white px-6 py-3 rounded-lg max-w-2xl z-50">
              <p className="text-center font-medium">
                {images[currentIndex].title}
              </p>
            </div>
          )}

          {/* Thumbnail Strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-3xl px-4 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? "ring-4 ring-white scale-105"
                    : "ring-2 ring-white/30 hover:ring-white/60 opacity-50 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title || `${marinaName} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
