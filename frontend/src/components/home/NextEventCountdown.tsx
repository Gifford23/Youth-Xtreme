import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  targetDate?: Date;
  title?: string;
}

const calculateTimeLeft = (target: number): TimeLeft => {
  const now = new Date().getTime();
  const difference = target - now;

  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
};

const getNextFriday = (): number => {
  const now = new Date();
  const target = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = (5 + 7 - dayOfWeek) % 7;

  target.setDate(now.getDate() + daysUntilFriday);
  target.setHours(19, 0, 0, 0); // 7:00 PM

  if (target.getTime() < now.getTime()) {
    target.setDate(target.getDate() + 7);
  }
  return target.getTime();
};

const NextEventCountdown = ({ targetDate, title }: CountdownProps) => {
  // ✅ FIX: Convert Date object to a primitive number (timestamp)
  // This ensures the value is stable even if the parent re-renders
  const targetTimestamp = useMemo(() => {
    return targetDate ? targetDate.getTime() : getNextFriday();
  }, [targetDate]);

  const displayTitle = title || "Encounter";

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetTimestamp)
  );

  useEffect(() => {
    // Immediate calculation to prevent 1s delay on load
    setTimeLeft(calculateTimeLeft(targetTimestamp));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTimestamp));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp]); // ✅ Only restarts if the numeric timestamp changes

  const timeUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HRS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <div className="w-full bg-brand-dark border-y border-white/5 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-brand-accent font-bold tracking-[0.2em] text-sm mb-2 uppercase animate-pulse">
            Mark Your Calendar
          </h3>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase italic leading-tight">
            Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white pr-2">
              {displayTitle}
            </span>
          </h2>
          <p className="text-brand-muted text-sm mt-2 font-mono">
            {new Date(targetTimestamp).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex gap-3 md:gap-6">
          {timeUnits.map((unit, index) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-brand-accent/0 group-hover:bg-brand-accent/10 transition-all duration-300"></div>
                <span className="text-xl md:text-3xl font-display font-bold text-white group-hover:text-brand-accent transition-colors">
                  {unit.value < 10 ? `0${unit.value}` : unit.value}
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-bold text-brand-muted mt-2 tracking-widest">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NextEventCountdown;
