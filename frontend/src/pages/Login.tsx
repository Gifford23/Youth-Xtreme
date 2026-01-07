import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import Logo from "../assets/Official-logo.png";

// 📸 BACKGROUND IMAGES LIST
const backgroundImages = [
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop", // First Image
  "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/548220661_1093330282877553_682378857481286695_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=PZHkG5oFXm0Q7kNvwHAEBIQ&_nc_oc=AdnK2mxb7yuTNMyiEXDiPEGNA-jBiPeUiVVVzsjIZkGJEkyOo8eFTZpbzjSw1fO3idI&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=4kc4-8tLvpA4p6DvxuMfKQ&oh=00_AfqRH4KmkVFdZ3gvD7SC8yr4IbE0CpTf1cgiiJpsuu_XWQ&oe=696181AF", // Second Image
  "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/548403682_1093330362877545_845517022796782631_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=sZL-v7qkg2oQ7kNvwGH4vwg&_nc_oc=AdkIiBSDYBPjz_iN8TOWLzRR5K3-PimYkjUcwCZODrX27tAnfCK_lHNZ_LeMwtK4nFg&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=OlzyATU_d5ciyrdt3EvR7A&oh=00_Afo4mvc0OqqEru2bY4Jn2gvbq2Wvd6dxqZuRwUD3KLwdeQ&oe=696193CE", // Third Image
  "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/517952902_1039160238294558_8204969679638417153_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=PIe29dJbHU0Q7kNvwEfGxGQ&_nc_oc=AdnqK8aINpdWgM0q5K5CJ86vRoGjYdAQEqzvQTM6Z5k9VpYdtea4uICGLTZEGVBBb9o&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=y-Tjtbh3Du4ia-YtAL2q-w&oh=00_AfpNavhC13QMAB2GmMOenDG1F_GxXSqUuEDgElDavDTbXg&oe=6961A985", // Fourth Image
];

const Login = () => {
  const navigate = useNavigate();

  // Toggle State
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 🔄 Track Active Image

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 CAROUSEL EFFECT (30 Seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // --- TRAFFIC COP & PROFILE CREATOR ---
  const handleUserRouting = async (user: any) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // 🚨 IMPORTANT: REPLACE THIS WITH YOUR EXACT ADMIN EMAIL
    const ADMIN_EMAIL = "your-email@gmail.com";

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // ✅ FIX 1: Force Admin Role if email matches (even if DB says "youth")
      if (user.email === ADMIN_EMAIL && userData.role !== "admin") {
        await setDoc(
          userDocRef,
          { ...userData, role: "admin" },
          { merge: true }
        );
        navigate("/admin");
        return;
      }

      // Standard Routing
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      // ✅ FIX 2: When creating a NEW user, check if it's the admin email
      const isAdmin = user.email === ADMIN_EMAIL;

      await setDoc(userDocRef, {
        email: user.email,
        role: isAdmin ? "admin" : "youth", // Auto-assign admin if email matches
        created_at: serverTimestamp(),
        name: user.displayName || name || "Youth Member",
        photo_url: user.photoURL || "",
      });

      // Redirect based on the role we just assigned
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: name });
        await handleUserRouting(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        await handleUserRouting(userCredential.user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please Sign In.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("Failed to authenticate. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleUserRouting(result.user);
    } catch (err: any) {
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-dark">
      {/* Visuals - Dynamic Slideshow */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-brand-accent/10 z-20"></div>

        {/* Render ALL images stacked, but fade opacity */}
        {backgroundImages.map((imgUrl, index) => (
          <img
            key={index}
            src={imgUrl}
            alt={`Slide ${index}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-60" : "opacity-0"
            }`}
          />
        ))}

        <div className="relative z-30 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="mb-6">
              <img
                src={Logo}
                alt="Youth Xtreme Logo"
                className="h-16 w-auto object-contain"
              />
            </div>

            <h1 className="text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
              {isSignUp ? "JOIN THE\nFAMILY." : "WELCOME\nBACK."}
            </h1>
            <p className="text-brand-muted text-lg max-w-md drop-shadow-md">
              {isSignUp
                ? "Create an account to RSVP for events, track your growth, and access exclusive content."
                : "Sign in to access your dashboard and stay connected with the community."}
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left mb-10">
            <div className="lg:hidden mb-6 flex justify-center">
              <img
                src={Logo}
                alt="Youth Xtreme Logo"
                className="h-14 w-auto object-contain"
              />
            </div>

            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {isSignUp ? "Create Account" : "Member Login"}
            </h2>
            <p className="text-brand-muted">
              {isSignUp
                ? "Join us today!"
                : "Admin or Youth? Sign in to continue."}
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isSignUp ? "Sign up with Google" : "Sign in with Google"}
            </button>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-brand-muted text-sm uppercase font-bold tracking-wider">
                Or email
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="animate-fade-in-down">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-brand-gray/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted focus:border-brand-accent focus:outline-none"
                    placeholder="Full Name"
                  />
                </div>
              )}

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-gray/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted focus:border-brand-accent focus:outline-none"
                placeholder="Email Address"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-gray/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted focus:border-brand-accent focus:outline-none"
                placeholder="Password (Min. 6 chars)"
              />

              {error && (
                <div className="text-red-400 text-sm font-bold">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-accent text-brand-dark font-bold py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-brand-muted mb-2">
              {isSignUp
                ? "Already have an account?"
                : "Don't have an account yet?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-sm font-bold text-white hover:text-brand-accent transition-colors uppercase tracking-widest"
            >
              {isSignUp ? "Sign In Instead" : "Create New Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
