import React from "react";
import { Link } from "react-router-dom";

interface EventProps {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl?: string;
  category: string;
}

const EventCard = ({ event }: { event: EventProps }) => {
  // 🛡️ SECURITY GUARD: If event data is missing, stop here.
  if (!event || !event.date) {
    return null;
  }

  // Safe to proceed now
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("default", { month: "short" });

  return (
    <div className="group relative bg-brand-gray rounded-3xl overflow-hidden border border-white/5 hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.1)]">
      {/* Image Section */}
      <div className="aspect-[4/3] bg-brand-dark/50 relative overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-muted">
            <span className="text-4xl">📅</span>
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-brand-accent text-brand-dark rounded-xl px-3 py-1.5 text-center font-bold shadow-lg">
          <div className="text-xs uppercase tracking-wider">{month}</div>
          <div className="text-2xl leading-none">{day}</div>
        </div>

        {/* Category Tag */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
          {event.category || "Event"}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-accent transition-colors">
          {event.title}
        </h3>

        <div className="flex items-center text-brand-muted text-sm mb-6 gap-2">
          {/* Location Icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-1">{event.location}</span>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="block w-full bg-white/5 hover:bg-white text-white hover:text-brand-dark text-center font-bold py-3 rounded-xl transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
