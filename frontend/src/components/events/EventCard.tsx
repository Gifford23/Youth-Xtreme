import { Link } from "react-router-dom";

interface EventProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
}

const EventCard = ({
  id,
  title,
  date,
  location,
  image,
  category,
}: EventProps) => {
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
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-gray to-transparent opacity-60"></div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-center space-x-2 text-brand-muted text-sm mb-3">
          <span>?? {date}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-brand-accent transition-colors">
          {title}
        </h3>

        <div className="flex items-center text-brand-muted text-sm mb-6">
          <span>?? {location}</span>
        </div>

        <Link
          to={`/events/${id}`}
          className="inline-flex w-full items-center justify-center py-3 rounded-lgyb border border-white/10 text-white text-sm font-semibold hover:bg-white hover:text-brand-dark transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
