import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DATA ---
const faqs = [
  {
    question: "Is this for High School or College students?",
    answer:
      "Youth Xtreme is primarily for High School and College students (ages 13-22). We have specific breakout groups for different age ranges so you'll always be with people in your season of life.",
  },
  {
    question: "Do I need to bring money?",
    answer:
      "Nope! Our weekly gatherings are completely free. Sometimes we have special events or merch for sale, but there is zero pressure to buy anything.",
  },
  {
    question: "What is the vibe? (Dress Code)",
    answer:
      "Come as you are. Seriously. Jeans, tees, hoodies, or your school uniform—it doesn't matter. We care about you, not your outfit.",
  },
  {
    question: "I'm not religious. Can I still come?",
    answer:
      "100%. You don't have to believe what we believe to belong here. We are a safe place to ask questions, have doubts, and explore faith at your own pace.",
  },
  {
    question: "Will I have to talk or do anything weird?",
    answer:
      "We won't make you stand up, introduce yourself to the crowd, or do anything awkward. You can hang back and observe until you're ready to jump in.",
  },
];

// --- COMPONENT: Single FAQ Item ---
const FaqItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span
          className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
            isOpen
              ? "text-brand-accent"
              : "text-white group-hover:text-brand-accent"
          }`}
        >
          {question}
        </span>
        <span className="relative ml-4 flex-shrink-0 w-6 h-6 flex items-center justify-center">
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            className="absolute w-full h-0.5 bg-white group-hover:bg-brand-accent transition-colors"
          />
          <motion.span
            animate={{ rotate: isOpen ? 45 : 90 }}
            className="absolute w-full h-0.5 bg-white group-hover:bg-brand-accent transition-colors"
          />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-brand-muted leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/5 via-brand-dark to-brand-dark pointer-events-none"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 uppercase"
          >
            Got{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">
              Questions?
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto"
          >
            We know walking into a new place can be intimidating. Here is
            everything you need to know before you pull up.
          </motion.p>
        </div>

        {/* FAQ Accordion List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-sm"
        >
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="text-white mb-4 font-bold">Still have a question?</p>
          <a
            href="https://m.me/yxcdo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-brand-accent font-bold hover:bg-brand-accent hover:text-black transition-all hover:scale-105"
          >
            Chat with a Leader
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default FaqPage;
