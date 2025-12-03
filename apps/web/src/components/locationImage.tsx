import React, { useState, useEffect } from "react";

const FALLBACK_PICTURES = [
  "/beer1.jpg",
  "/beer2.svg",
  "/beer3.jpg",
  "/beer4.jpg",
  "/beer5.jpg"
];

interface LocationImageProps {
  src: string | null;
  alt: string;
  locationId: number;
  className?: string;
}

const LocationImage: React.FC<LocationImageProps> = ({ src, alt, locationId, className }) => {

  const fallbackIndex = (locationId - 1) % FALLBACK_PICTURES.length;
  const safeIndex = fallbackIndex < 0 ? 0 : fallbackIndex;
  const fallbackSrc = FALLBACK_PICTURES[safeIndex];

  const [currentSrc, setCurrentSrc] = useState<string>(fallbackSrc);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    setCurrentSrc(fallbackSrc);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
    };

    img.onerror = () => {
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return (
    <img 
      src={currentSrc} 
      alt={alt} 
      className={className} 
      loading="lazy" 
    />
  );
};

export default LocationImage;