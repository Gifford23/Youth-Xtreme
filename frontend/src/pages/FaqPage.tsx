import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Added Link
import { motion, AnimatePresence } from "framer-motion";

// --- BIBLICAL & YOUTH-FRIENDLY DATA ---
const faqs = [
  {
    question: "Is there a space for me here?",
    answer:
      "We are a community of High School and College students (ages 13-22) chasing after God's heart. Psalm 68:6 says 'God sets the lonely in families,' and we believe there is a breakout group here that has been waiting just for you.",
  },
  {
    question: "Do I need to bring anything?",
    answer:
      "Just bring yourself. Jesus simply says, 'Come to me, all you who are weary, and I will give you rest' (Matthew 11:28). You don’t need to be perfect or perform. Just come, breathe, and receive.",
  },
  {
    question: "What is the fit check? (Dress Code)",
    answer:
      "1 Samuel 16:7 tells us: 'The Lord looks at the heart.' We care about you, not your outfit. Whether you're in a school uniform, hoodie, or Sunday best—come as you are. You are welcome in His presence.",
  },
  {
    question: "I have doubts / I'm not religious...",
    answer:
      "You are safe here. Jesus said, 'Come to me, all you who are weary' (Matthew 11:28)—He didn't say 'Come to me, all you who are perfect.' This is a safe harbor to ask questions, wrestle with doubts, and encounter the Holy Spirit at your own pace.",
  },
  {
    question: "Will I be pressured to do anything?",
    answer:
      "Where the Spirit of the Lord is, there is freedom (2 Corinthians 3:17). We will never force you to stand up, speak out, or be weird. You can sit back, soak in the worship, and just 'be still' until you're ready to jump in.",
  },
];

// --- COMPONENT: Single FAQ Card ---
const FaqItem = ({
  question,
  answer,
  isOpen,
  onClick,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`group rounded-3xl border transition-all duration-500 overflow-hidden ${
        isOpen
          ? "bg-brand-gray/40 border-brand-accent/30 shadow-[0_0_30px_rgba(204,255,0,0.05)]"
          : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span
          className={`text-lg md:text-xl font-medium tracking-wide transition-colors duration-300 ${
            isOpen
              ? "text-brand-accent"
              : "text-white/90 group-hover:text-white"
          }`}
        >
          {question}
        </span>

        <div
          className={`relative ml-4 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
            isOpen
              ? "bg-brand-accent text-brand-dark border-brand-accent rotate-180"
              : "bg-transparent text-white/50 border-white/20 group-hover:border-white/50 group-hover:text-white"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="px-8 pb-8">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>
              <p className="text-brand-muted text-lg leading-relaxed font-light italic">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showPopup, setShowPopup] = useState(false); // ✅ Pop-up State

  // ✅ Trigger Pop-up after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-24 px-6 relative overflow-hidden isolate">
      {/* --- ATMOSPHERE --- */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[128px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 50, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-brand-accent mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
            Scripture &bull; Spirit &bull; Safe Space
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
          >
            Come Sit{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-white to-brand-accent animate-gradient-x">
              With Us
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
          >
            "God sets the lonely in families." (Psalm 68:6). <br />
            No prerequisites. No judgment. Just a place to belong.
          </motion.p>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              index={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Bottom Contact (Messenger) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 text-center"
        >
          <div className="inline-block p-1 rounded-full bg-gradient-to-br from-white/10 to-transparent">
            <div className="px-10 py-12 rounded-full bg-brand-dark/50 backdrop-blur-md border border-white/5">
              <p className="text-white text-lg mb-6 font-light">
                Need prayer or just want to talk? <br />
                <span className="text-brand-muted text-sm">
                  We are here to walk this journey with you.
                </span>
              </p>
              <a
                href="https://m.me/yxcdo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand-dark rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Let's Connect
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ✅ PROFESSIONAL CONNECT POP-UP */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 z-50 w-full max-w-[340px] px-4 sm:px-0"
          >
            <div className="relative bg-brand-gray/90 backdrop-blur-xl border border-brand-accent/30 p-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-4">
              {/* Close Button */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 left
                -2 text-white/30 hover:text-white transition-colors p-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-brand-accent text-brand-dark flex items-center justify-center shrink-0">
                <span className="text-xl">🫶🏻</span>
              </div>

              {/* Text */}
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm mb-0.5">
                  No Accidents.
                </h4>
                <p className="text-brand-muted text-xs leading-tight mb-3">
                  We believe God ordered your steps to be here today. We'd love
                  to meet you!
                </p>
                <Link
                  to="/connect"
                  className="text-xs font-bold text-brand-accent hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  Connect With Us &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FaqPage;
