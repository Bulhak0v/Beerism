import React, { useState, useEffect } from "react";
import "./slider.css";

function CustomCarousel({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);


  useEffect(() => {
    if (paused) return;

    const timer = setTimeout(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === children.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);


    return () => clearTimeout(timer);
  }, [activeIndex, paused, children.length]);

  return (
    <div
      className="container__slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {children.map((item, index) => {
        return (
          <div
            className={activeIndex === index ? "slider__item active" : "slider__item"}
            key={index}
          >
            {item}
          </div>
        );
      })}

      <div className="container__slider__links">
        {children.map((item, index) => {
          return (
            <button
              key={index}
              className={
                activeIndex === index
                  ? "container__slider__links-small container__slider__links-small-active"
                  : "container__slider__links-small"
              }
              onClick={(e) => {
                e.preventDefault();
                setActiveIndex(index);
              }}
            ></button>
          );
        })}
      </div>
    </div>
  );
}

export default CustomCarousel;