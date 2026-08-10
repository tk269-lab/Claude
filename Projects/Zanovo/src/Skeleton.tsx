import { useState } from "react";

/**
 * Shimmering placeholder block. Matches the skeletons in the Zanovo dashboard
 * and Runway so the whole product family loads the same way.
 *
 * The shimmer is defined in index.css as `.zk-shimmer`, which drops to a
 * static block under `prefers-reduced-motion`.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`zk-shimmer rounded-xl ${className}`} />;
}

type ImgProps = {
  src: string;
  alt: string;
  className?: string;
  /** Wrapper classes — the skeleton is absolutely positioned inside it. */
  wrapperClassName?: string;
};

/**
 * An image that shows a shimmer in its own footprint until it decodes.
 *
 * These are large hero/section photos on a South African mobile connection,
 * where the alternative is a blank white gap for as long as the download
 * takes. The skeleton sits behind the image rather than swapping with it, so
 * there's no layout shift when it lands.
 */
export function ImageWithSkeleton({ src, alt, className = "", wrapperClassName = "" }: ImgProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {loaded ? null : <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        // Cached images can fire load before React attaches the handler; the
        // ref check settles those so the skeleton can't get stuck on screen.
        ref={(node) => {
          if (node?.complete) setLoaded(true);
        }}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
