import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// 📸 HIGH-QUALITY MOCK DATA
// Replace these with your actual event photos later!
const MOMENTS = [
  {
    id: 1,
    url: "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/516744760_1039160291627886_2374253926826939664_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=-C89nIIu97QQ7kNvwHrj0PM&_nc_oc=AdkEPkO7R1jpKbaHXIDNoPs6059x05tUTpf6QenY1vokz8LfqfRZGFWMPCgM0jKqOXo&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=eET1WTUswil3zHR9I6w6Qw&oh=00_AfoLjxk09GEs4AcqdbIcrItSwdUKmXP6-vkzhIdgXfxu7w&oe=6966B228",
    caption: "Worship Night",
  },
  {
    id: 2,
    url: "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/516546333_1039160524961196_7193095470575035584_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=K-_BsqhQa64Q7kNvwHuaX1d&_nc_oc=AdngwA6CeQVoQ_UYyYscWNgnFS6X9x-CFdgaTTV_zw-xSBMVwsU9zseGyz5khuvFRQw&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=MPBIKIIGSg1MADOxRzkMJw&oh=00_Afo7Jmi85FWkoWUPO0OAJGvs3Y3OjPNN0ef7ClthYGVjcA&oe=6966D6B9",
    caption: "Huddle",
  },
  {
    id: 3,
    url: "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/516541277_1039161651627750_2232541084280064129_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=PGdbqdQDs9EQ7kNvwGdGJIQ&_nc_oc=AdlbWAi0znTCuyY0FtViYJ8qZQFVQiLjf0ZQkER_freg7TsWEv3M6BcW5ZTgL_eNqs0&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=ccSh9RCOJ414Ajfk7z9ecw&oh=00_AfqCHQugx_rp9tla-ImgY9E50-jAkiP_EeQGUkgobVs1pg&oe=6966C9C8",
    caption: "Group Pictures",
  },
  {
    id: 4,
    url: "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/516867446_1039161838294398_3626381345563479035_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CdkOIxRd2-0Q7kNvwEsozUV&_nc_oc=AdlHTz0InVXdGWZRalvg4PqgewlAZ46j-h_hkC18JIVhht-1uQ4PNoQz1M7efxScDlk&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=KO8LTU4smzMdNzBKE12SGA&oh=00_AfracbXcVxanwRio_WFpNpDWpojKACW0NMG1Op47QVFBtQ&oe=6966C721",
    caption: "Moments",
  },
  {
    id: 5,
    url: "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/516792907_1039161038294478_7066308658921254478_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=RyHWMu_JVH0Q7kNvwH8FMy0&_nc_oc=AdnwPdg6z1nx2hRVKFEFY4Xo1Wm3E_gHIvllJgsmSnw_E27MGAC3wOpJ6WfTCVggXuM&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=uEDje6shjNKFRI5Z7e2Mqw&oh=00_AfoVOQ7zmOT5Lsn4DFobJ6FrY4nHvFOK8Q02vIfq6h-gvA&oe=6966B733",
    caption: "Commitments to MMM",
  },
  {
    id: 6,
    url: "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/517339782_1039161521627763_6477359528226062393_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=KErVlFM19okQ7kNvwF2dRuw&_nc_oc=AdkE2gPlsirsrhGSIHx9Ku_9v8ZvhHGrN6UUpHBd6uySGz6fn-yMaFkzW4UrD5eBlVw&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=qXFlYNIrVmBvzKTQsWnWTA&oh=00_AfogA_56pxhvsjKuxngeJpBvFlZsNFnR594hzShStvE-lA&oe=6966BBFF",
    caption: "Prayer",
  },
];

const Moments = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"],
  });

  // Parallax Effect: Moves the row slightly left as you scroll down
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <div className="py-24 bg-brand-dark overflow-hidden border-t border-white/5 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-accent/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-brand-accent font-bold uppercase tracking-widest text-xs">
              Moments Captured
            </span>
          </div>
          <h2 className="text-3xl font-sans font-bold text-white uppercase tracking-widest">
            Relive the{" "}
            <span className="italic font-medium opacity-90 pr-2">
              Experience
            </span>
          </h2>
        </div>

        <a
          href="https://www.instagram.com/youthxtremecdeo/"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 text-white border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-brand-dark transition-all font-bold text-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Follow @youthxtremecdeo
        </a>
      </div>

      {/* HORIZONTAL SCROLL AREA */}
      <div ref={scrollRef} className="relative w-full">
        <motion.div
          style={{ x }} // Connects to the parallax hook
          className="flex gap-6 px-6 lg:px-8 w-max hover:pause"
        >
          {MOMENTS.map((moment) => (
            <div
              key={moment.id}
              className="relative group w-72 h-96 rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img
                src={moment.url}
                alt={moment.caption}
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

              {/* Caption */}
              <div className="absolute bottom-4 left-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <span className="text-brand-accent text-xs font-bold uppercase tracking-wider mb-1 block">
                  #YouthXtreme
                </span>
                <p className="text-white font-bold text-lg">{moment.caption}</p>
              </div>
            </div>
          ))}

          {/* Duplicate list for "infinite" feeling if needed, or just let it end */}
          {MOMENTS.map((moment) => (
            <div
              key={`${moment.id}-duplicate`}
              className="relative group w-72 h-96 rounded-2xl overflow-hidden cursor-pointer hidden md:block opacity-50"
            >
              <img
                src={moment.url}
                alt={moment.caption}
                className="w-full h-full object-cover grayscale"
              />
            </div>
          ))}
        </motion.div>

        {/* Mobile Swipe Hint */}
        <div className="absolute bottom-4 right-8 md:hidden text-white/50 text-xs font-bold animate-pulse">
          ← Swipe to see more
        </div>
      </div>
    </div>
  );
};

export default Moments;
