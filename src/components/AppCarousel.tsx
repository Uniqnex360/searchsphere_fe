import { useState } from "react";

type ImageItem = {
  url: string;
  name: string;
};

type AppCarouselProps = {
  images: ImageItem[];
};

const AppCarousel: React.FC<AppCarouselProps> = ({ images }) => {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full group overflow-hidden rounded-xl">
      {/* Image */}
      <img
        src={images[index].url}
        alt={images[index].name}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
      />

      {/* Gradient Overlay (minimal aesthetic) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Controls (only visible on hover) */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition bg-white/70 hover:bg-white text-black p-2 rounded-full shadow"
      >
        ‹
      </button>

      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition bg-white/70 hover:bg-white text-black p-2 rounded-full shadow"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AppCarousel;
