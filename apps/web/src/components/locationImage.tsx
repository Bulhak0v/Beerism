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

  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      onError={handleError}
      loading="lazy" 
    />
  );
};

export default LocationImage;