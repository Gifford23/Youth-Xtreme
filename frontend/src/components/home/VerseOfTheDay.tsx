import { useState, useEffect } from "react";

interface VerseData {
  text: string;
  reference: string;
  version?: string;
}

interface VerseProps {
  className?: string;
}

const VerseOfTheDay = ({ className = "" }: VerseProps) => {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const res = await fetch(
          "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily"
        );
        const data = await res.json();

        if (data.verse) {
          setVerse({
            text: data.verse.details.text,
            reference: data.verse.details.reference,
            version: data.verse.details.version,
          });
        }
      } catch (error) {
        console.error("Failed to fetch verse:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
  }, []);

  if (loading) return null;
  if (!verse) return null;

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <div className="bg-brand-gray/60 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:bg-brand-gray/80 transition-all duration-500">
        {/* Decorative Quote Mark */}
        <div className="absolute top-4 right-6 text-6xl text-white/5 font-serif font-bold">
          ”
        </div>

        {/* Label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
          <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">
            Daily Inspiration
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl md:text-2xl font-serif text-white italic leading-relaxed mb-6">
            "{verse.text}"
          </h3>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-brand-accent font-bold text-sm uppercase tracking-wide">
              {verse.reference}
            </span>
            <span className="text-xs text-brand-muted">
              {verse.version || "NIV"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseOfTheDay;
