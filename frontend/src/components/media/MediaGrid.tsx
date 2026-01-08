import React from "react";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  caption: string;
}

interface MediaGridProps {
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
}

const MediaGrid = ({ items, onItemClick }: MediaGridProps) => {
  if (items.length === 0) return null;

  const count = items.length;
  // We handle up to 4 preview items. Any more are hidden behind the overlay.
  const displayItems = items.slice(0, 4);
  const remaining = count - 4;

  // Helper to render a single item
  const renderItem = (item: MediaItem, index: number, hasOverlay: boolean) => (
    <div
      key={item.id}
      onClick={() => onItemClick(item)}
      className="relative w-full h-full cursor-pointer overflow-hidden group bg-black/20"
    >
      <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
        {item.type === "video" ? (
          <div className="relative w-full h-full bg-brand-dark flex items-center justify-center">
            {/* If we have a thumb, show it, otherwise simple placeholder */}
            <img
              src={item.thumbnail || item.url}
              alt="Video"
              className="w-full h-full object-cover opacity-80"
              // Fallback for video files used as img src (works in some browsers for previews)
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg
                  className="w-6 h-6 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.caption}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* "+X More" Overlay */}
      {hasOverlay && remaining > 0 && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-3xl font-display font-bold text-white tracking-widest">
            +{remaining}
          </span>
        </div>
      )}
    </div>
  );

  // --- LAYOUTS ---

  // 1. Single Item (Full Width)
  if (count === 1) {
    return (
      <div className="h-96 w-full bg-black/50">
        {renderItem(items[0], 0, false)}
      </div>
    );
  }

  // 2. Two Items (Split Vertical)
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 h-80">
        {renderItem(items[0], 0, false)}
        {renderItem(items[1], 1, false)}
      </div>
    );
  }

  // 3. Three Items (Left Hero, Two Right)
  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 h-96">
        <div className="col-span-1 h-full">
          {renderItem(items[0], 0, false)}
        </div>
        <div className="col-span-1 flex flex-col gap-1 h-full">
          <div className="h-1/2">{renderItem(items[1], 1, false)}</div>
          <div className="h-1/2">{renderItem(items[2], 2, false)}</div>
        </div>
      </div>
    );
  }

  // 4+ Items (Top Hero, Three Bottom Columns)
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 h-[500px]">
      {/* Hero Image (Top 2/3rds) */}
      <div className="col-span-3 row-span-2">
        {renderItem(items[0], 0, false)}
      </div>

      {/* Bottom Row */}
      <div className="col-span-1 row-span-1">
        {renderItem(items[1], 1, false)}
      </div>
      <div className="col-span-1 row-span-1">
        {renderItem(items[2], 2, false)}
      </div>
      <div className="col-span-1 row-span-1">
        {renderItem(items[3], 3, true)} {/* Overlay Trigger */}
      </div>
    </div>
  );
};

export default MediaGrid;
