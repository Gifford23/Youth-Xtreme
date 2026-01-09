import { useState, useEffect, useRef } from "react";

// 🎨 PRESET BACKGROUNDS
const BACKGROUNDS = [
  {
    id: 1,
    name: "Midnight Hype",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
    color: "#CCFF00",
  },
  {
    id: 2,
    name: "Electric Blue",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
    color: "#00F0FF",
  },
  {
    id: 3,
    name: "Worship Flow",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop",
    color: "#FFFFFF",
  },
  {
    id: 4,
    name: "Urban Grit",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
    color: "#FF003C",
  },
];

// 📐 ASPECT RATIOS
const FORMATS = {
  story: {
    id: "story",
    label: "Story (9:16)",
    width: 1080,
    height: 1920,
    aspect: "9/16",
  },
  portrait: {
    id: "portrait",
    label: "Post (4:5)",
    width: 1080,
    height: 1350,
    aspect: "4/5",
  },
  square: {
    id: "square",
    label: "Square (1:1)",
    width: 1080,
    height: 1080,
    aspect: "1/1",
  },
};

const InviteGenerator = () => {
  // --- CONTENT STATE ---
  const [friendName, setFriendName] = useState("");
  const [eventName, setEventName] = useState("FRIDAY NIGHT LIVE");
  const [eventDetails, setEventDetails] = useState("THIS FRIDAY • 7:00 PM");

  // --- VISUAL STATE ---
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] =
    useState<keyof typeof FORMATS>("story"); // New State

  // --- LAYOUT STATE ---
  const [offsetGreeting, setOffsetGreeting] = useState(0);
  const [offsetHeadline, setOffsetHeadline] = useState(0);
  const [offsetDetails, setOffsetDetails] = useState(0);
  const [showLayoutTools, setShowLayoutTools] = useState(false);

  // --- IMAGE PANNING STATE ---
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // --- UI STATE ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomImage(result);
        setImagePan({ x: 0, y: 0 });
        setSelectedBg({
          id: 999,
          name: "Custom Upload",
          url: result,
          color: "#FFFFFF",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStart.current = { x: clientX, y: clientY };
    panStart.current = { ...imagePan };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    setImagePan({
      x: panStart.current.x + deltaX * 2.5,
      y: panStart.current.y + deltaY * 2.5,
    });
  };

  // --- CANVAS DRAWING LOGIC ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedBg.url;

    img.onload = () => {
      // 1. Setup Canvas Dimensions based on selected format
      const currentFormat = FORMATS[selectedFormat];
      canvas.width = currentFormat.width;
      canvas.height = currentFormat.height;

      // 2. Draw Background
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const x = canvas.width / 2 - (img.width / 2) * scale + imagePan.x;
      const y = canvas.height / 2 - (img.height / 2) * scale + imagePan.y;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // 3. Dark Overlay
      ctx.fillStyle = customImage
        ? "rgba(0, 0, 0, 0.60)"
        : "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4. Text Configuration
      ctx.textAlign = "center";

      // BRANDING (Fixed at top)
      ctx.fillStyle = selectedBg.color;
      ctx.font = "bold 60px sans-serif";
      ctx.letterSpacing = "10px";
      ctx.fillText("YOUTH XTREME", canvas.width / 2, 120); // Moved up slightly

      // --- DYNAMIC POSITIONING ---
      const centerY = canvas.height / 2;

      // GREETING GROUP
      const greetingY = centerY - 150 + offsetGreeting;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 110px sans-serif";
      const nameText = friendName
        ? `YO ${friendName.toUpperCase()}!`
        : "HEY FRIEND!";
      ctx.fillText(nameText, canvas.width / 2, greetingY);

      ctx.font = "italic 50px sans-serif";
      ctx.fillText("YOU'RE INVITED TO", canvas.width / 2, greetingY + 90);

      // HEADLINE GROUP
      const headlineY = centerY + 100 + offsetHeadline;
      ctx.font = "900 130px sans-serif";
      ctx.fillStyle = selectedBg.color;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 40;
      ctx.fillText(eventName.toUpperCase(), canvas.width / 2, headlineY);
      ctx.shadowBlur = 0;

      // DETAILS GROUP
      // We attach this to the bottom, but adjust based on canvas height
      const detailsY = canvas.height - 300 + offsetDetails;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 50px sans-serif";
      ctx.fillText(eventDetails.toUpperCase(), canvas.width / 2, detailsY);

      // FOOTER
      ctx.font = "40px sans-serif";
      ctx.globalAlpha = 0.8;
      ctx.fillText("@yxcdo", canvas.width / 2, canvas.height - 200);
      ctx.globalAlpha = 1.0;

      // THIN BORDER
      ctx.strokeStyle = selectedBg.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      setPreviewUrl(canvas.toDataURL("image/png"));
    };
  }, [
    friendName,
    selectedBg,
    eventName,
    eventDetails,
    customImage,
    offsetGreeting,
    offsetHeadline,
    offsetDetails,
    imagePan,
    selectedFormat,
  ]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    const link = document.createElement("a");
    link.download = `Invite-${selectedFormat}-${friendName || "Friend"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setTimeout(() => setIsGenerating(false), 1500);
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-4 relative">
      {/* 👁️ PREVIEW MODAL */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brand-gray border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden max-h-[70vh]">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="flex gap-4 mt-6 w-full max-w-sm">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-brand-accent text-brand-dark font-bold rounded-xl hover:bg-white transition-all shadow-lg"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Invite <span className="text-brand-accent">Generator</span>
          </h1>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg">
            Create custom graphics for Stories, Feeds, or DMs.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* --- LEFT: CONTROLS --- */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. CONTENT */}
            <div className="bg-brand-gray/50 border border-white/5 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-full bg-brand-accent text-brand-dark flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-white font-bold uppercase tracking-wider">
                  Content
                </h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                    Friend's Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mark"
                    maxLength={15}
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none transition-all placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                    Event Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FRIDAY NIGHT LIVE"
                    maxLength={20}
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-brand-accent focus:outline-none transition-all placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                    When / Where
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. THIS FRIDAY • 7 PM"
                    maxLength={30}
                    value={eventDetails}
                    onChange={(e) => setEventDetails(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none transition-all placeholder-white/20"
                  />
                </div>
              </div>
            </div>

            {/* 2. VISUALS */}
            <div className="bg-brand-gray/50 border border-white/5 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-full bg-brand-accent text-brand-dark flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-white font-bold uppercase tracking-wider">
                  Visuals
                </h3>
              </div>

              {/* ✅ FORMAT TOGGLES */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                  Select Format
                </label>
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 rounded-xl">
                  {(Object.keys(FORMATS) as Array<keyof typeof FORMATS>).map(
                    (fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          selectedFormat === fmt
                            ? "bg-brand-accent text-brand-dark shadow-md"
                            : "text-brand-muted hover:text-white"
                        }`}
                      >
                        {FORMATS[fmt].label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* LAYOUT TOOLS */}
              <button
                onClick={() => setShowLayoutTools(!showLayoutTools)}
                className="w-full mb-6 flex items-center justify-between bg-black/30 px-4 py-3 rounded-xl border border-white/5 hover:bg-black/50 transition-all"
              >
                <span className="text-sm font-bold text-white flex items-center gap-2">
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  {showLayoutTools ? "Hide Adjusters" : "Adjust Layout"}
                </span>
                <span className="text-brand-accent text-xl">
                  {showLayoutTools ? "−" : "+"}
                </span>
              </button>

              {showLayoutTools && (
                <div className="space-y-4 mb-6 bg-black/20 p-4 rounded-xl animate-fade-in">
                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-brand-muted uppercase mb-1">
                      <span>Greeting Y-Axis</span>
                      <span>{offsetGreeting}</span>
                    </label>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={offsetGreeting}
                      onChange={(e) =>
                        setOffsetGreeting(Number(e.target.value))
                      }
                      className="w-full accent-brand-accent h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-brand-muted uppercase mb-1">
                      <span>Headline Y-Axis</span>
                      <span>{offsetHeadline}</span>
                    </label>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={offsetHeadline}
                      onChange={(e) =>
                        setOffsetHeadline(Number(e.target.value))
                      }
                      className="w-full accent-brand-accent h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-brand-muted uppercase mb-1">
                      <span>Details Position</span>
                      <span>{offsetDetails}</span>
                    </label>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={offsetDetails}
                      onChange={(e) => setOffsetDetails(Number(e.target.value))}
                      className="w-full accent-brand-accent h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setOffsetGreeting(0);
                        setOffsetHeadline(0);
                        setOffsetDetails(0);
                      }}
                      className="flex-1 py-2 text-xs bg-white/5 rounded hover:bg-white/10 transition-colors text-white"
                    >
                      Reset Text
                    </button>
                    <button
                      onClick={() => setImagePan({ x: 0, y: 0 })}
                      className="flex-1 py-2 text-xs bg-white/5 rounded hover:bg-white/10 transition-colors text-white"
                    >
                      Reset Image
                    </button>
                  </div>
                </div>
              )}

              {/* Upload & Grid */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-brand-muted hover:text-white hover:border-brand-accent hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide"
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Upload Photo
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setSelectedBg(bg);
                      setCustomImage(null);
                      setImagePan({ x: 0, y: 0 });
                    }}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all group ${
                      selectedBg.id === bg.id && !customImage
                        ? "border-brand-accent scale-105 ring-2 ring-brand-accent/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={bg.url}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm"
                      style={{ backgroundColor: bg.color }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Preview
              </button>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 bg-brand-accent text-brand-dark font-bold py-4 rounded-2xl text-lg shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? "Processing..." : "Download"}
              </button>
            </div>
          </div>

          {/* --- RIGHT: PREVIEW (Sticky) --- */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center lg:sticky lg:top-32">
            {/* DYNAMIC FRAME: Changes based on format */}
            <div
              className={`relative bg-black border-4 border-gray-900 shadow-2xl overflow-hidden w-full ring-8 ring-white/5 cursor-move transition-all duration-500 ease-in-out ${
                selectedFormat === "story"
                  ? "rounded-[3rem] max-w-[380px]"
                  : "rounded-3xl max-w-[500px]"
              }`}
            >
              {/* Notch (Only for Story) */}
              {selectedFormat === "story" && (
                <>
                  <div className="absolute top-0 inset-x-0 h-8 bg-black z-20 flex justify-center items-center pointer-events-none">
                    <div className="w-24 h-5 bg-gray-900 rounded-b-xl flex items-center justify-center gap-2">
                      <div className="w-10 h-1 bg-black/50 rounded-full"></div>
                      <div className="w-1 h-1 bg-blue-900/50 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-6 text-[10px] text-white font-bold z-20 pointer-events-none">
                    9:41
                  </div>
                  <div className="absolute top-2 right-6 flex gap-1 z-20 pointer-events-none">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </>
              )}

              {/* INTERACTIVE CANVAS CONTAINER */}
              <div
                className="relative w-full bg-gray-800 transition-all duration-500"
                style={{ aspectRatio: FORMATS[selectedFormat].aspect }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={() => setIsDragging(false)}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Home Indicator (Only for Story) */}
              {selectedFormat === "story" && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-20 backdrop-blur-md pointer-events-none"></div>
              )}
            </div>

            <p className="text-xs text-brand-muted mt-4 flex items-center gap-2 animate-pulse">
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              Drag image to reposition • Double-click to reset
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteGenerator;
