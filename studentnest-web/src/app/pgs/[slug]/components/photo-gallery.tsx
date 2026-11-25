"use client";

import { useEffect, useRef, useState } from "react";
import type { SamplePhoto } from "../../data/sample-pg-details";

interface PhotoGalleryProps {
  title: string;
  photos: SamplePhoto[];
}

export default function PhotoGallery({ title, photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const mainPhotoButton = useRef<HTMLButtonElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const currentPhoto = photos[selectedPhoto];

  useEffect(() => {
    if (!viewerOpen) return;
    viewer.current?.focus();
    const returnFocusTarget = mainPhotoButton.current;
    return () => returnFocusTarget?.focus();
  }, [viewerOpen]);

  function movePhoto(direction: number) {
    setSelectedPhoto(
      (current) => (current + direction + photos.length) % photos.length,
    );
  }

  return (
    <section className="pgd-gallery" aria-label={`${title} sample photo gallery`}>
      <div className="pgd-galleryMain">
        <button
          className="pgd-mainPhoto"
          type="button"
          ref={mainPhotoButton}
          aria-label={`Open full-size ${currentPhoto.label}`}
          style={{ backgroundImage: `url("${currentPhoto.src}")` }}
          onClick={() => setViewerOpen(true)}
        >
          <span className="pgd-photoBadge">Representative sample photo</span>
          <span className="pgd-expandPhoto">View larger</span>
        </button>
        <div className="pgd-galleryThumbs" aria-label="Choose a sample photo">
          {photos.map((photo, index) => (
            <button
              className={`pgd-galleryThumb${selectedPhoto === index ? " is-active" : ""}`}
              key={`${index}-${photo.src}`}
              type="button"
              aria-label={`Show ${photo.label}`}
              aria-pressed={selectedPhoto === index}
              style={{ backgroundImage: `url("${photo.src}")` }}
              onClick={() => setSelectedPhoto(index)}
            >
              <span>{photo.label}</span>
            </button>
          ))}
        </div>
      </div>
      {viewerOpen && (
        <div
          className="pgd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} sample photo viewer`}
          ref={viewer}
          tabIndex={-1}
          onClick={() => setViewerOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setViewerOpen(false);
            if (event.key === "ArrowLeft") movePhoto(-1);
            if (event.key === "ArrowRight") movePhoto(1);
          }}
        >
          <div
            className="pgd-lightboxPanel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pgd-lightboxTop">
              <span>{currentPhoto.label}</span>
              <button
                type="button"
                aria-label="Close photo viewer"
                onClick={() => setViewerOpen(false)}
              >
                ×
              </button>
            </div>
            <div
              className="pgd-lightboxPhoto"
              role="img"
              aria-label={currentPhoto.label}
              style={{ backgroundImage: `url("${currentPhoto.src}")` }}
            />
            <div className="pgd-lightboxControls">
              <button type="button" onClick={() => movePhoto(-1)}>
                Previous
              </button>
              <span>
                {selectedPhoto + 1} / {photos.length}
              </span>
              <button type="button" onClick={() => movePhoto(1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
