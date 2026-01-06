import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <div className="relative py-32 isolate overflow-hidden">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop"
        alt="Crowd cheering"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-brand-dark/40"></div>

      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl uppercase mb-6 drop-shadow-lg">
          Don't Do Life <span className="text-brand-accent">Alone</span>
        </h2>
        <p className="mx-auto max-w-xl text-lg leading-8 text-gray-300 mb-10">
          Whether you're exploring faith or looking for a community to call
          home, there's a place for you here.
        </p>
        <div className="flex items-center justify-center gap-x-6">
          <Link
            to="/connect"
            className="rounded-full bg-white px-8 py-4 text-sm font-bold text-brand-dark shadow-xl hover:bg-brand-accent transition-all hover:scale-105"
          >
            I'm New Here
          </Link>
          <Link
            to="/events"
            className="text-sm font-semibold leading-6 text-white hover:text-brand-accent transition-colors"
          >
            See What's Coming Up <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
