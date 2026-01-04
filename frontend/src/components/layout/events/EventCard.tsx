// This defines what data we need to build a card
interface EventProps {
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
}

const EventCard = ({ title, date, location, image, category }: EventProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-brand-gray border border-white/5 transition-all duration-300 hover:border-brand-accent/50 hover:shadow-2xl hover:shadow-brand-accent/10 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute top-4 left-4 z-10 bg-brand-accent text-brand-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {category}
        </div>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-gray to-transparent opacity-60"></div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-center space-x-2 text-brand-muted text-sm mb-3">
          {/* Calendar Icon */}
          <svg
            className="w-4 h-4 text-brand-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{date}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-brand-accent transition-colors">
          {title}
        </h3>

        <div className="flex items-center text-brand-muted text-sm mb-6">
          {/* Location Icon */}
          <svg
            className="w-4 h-4 mr-2"
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
          {location}
        </div>

        <button className="w-full py-3 rounded-lg border border-white/10 text-white text-sm font-semibold hover:bg-white hover:text-brand-dark transition-all duration-300">
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;
