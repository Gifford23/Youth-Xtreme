import { useParams, Link, useNavigate } from "react-router-dom";
import { resourcesData } from "../lib/resourcesData";
import { useEffect } from "react";

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the resource matching the URL ID
  const resource = resourcesData.find(r => r.id === Number(id));

  // Scroll to top when opening
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!resource) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Story not found</h2>
        <button onClick={() => navigate("/resources")} className="text-brand-accent hover:underline">
          ← Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-20">
      {/* HERO IMAGE */}
      <div className="h-[50vh] relative w-full overflow-hidden">
        <img 
          src={resource.image} 
          alt={resource.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent"></div>
        
        {/* Navigation Back */}
        <div className="absolute top-24 left-4 md:left-12 z-10">
            <Link to="/resources" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-bold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Library
            </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-brand-accent text-brand-dark font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        {resource.category}
                    </span>
                    <span className="text-white/80 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {resource.readTime}
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 leading-tight">
                    {resource.title}
                </h1>
                <p className="text-xl text-white/80 font-serif italic">
                    {resource.scripture}
                </p>
            </div>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-brand-gray border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl">
            {/* The content is injected here */}
            <div 
                className="prose prose-invert prose-lg max-w-none text-brand-muted"
                dangerouslySetInnerHTML={{ __html: resource.content || "" }} 
            />
            
            <div className="mt-12 pt-8 border-t border-white/10">
                
                {/* ✅ NEW: Read Full Chapter Button */}
                {resource.externalLink && (
                    <div className="mb-8">
                        <a 
                            href={resource.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-white text-black font-bold py-4 rounded-xl hover:bg-brand-accent hover:text-black transition-all shadow-lg transform hover:scale-[1.01]"
                        >
                            📖 Read {resource.scripture} on Bible Gateway
                        </a>
                    </div>
                )}

                <h4 className="text-white font-bold mb-4">Share this story</h4>
                <div className="flex gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        Facebook
                    </button>
                    <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        Twitter
                    </button>
                    <button 
                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;