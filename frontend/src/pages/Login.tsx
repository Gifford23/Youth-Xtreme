import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // ✅ New Import
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile, // ✅ To save their name
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const Login = () => {
  const navigate = useNavigate();

  // Toggle State
  const [isSignUp, setIsSignUp] = useState(false); // Default to Login

  // Form Fields
  const [name, setName] = useState(""); // Only for Sign Up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- TRAFFIC COP & PROFILE CREATOR ---
  const handleUserRouting = async (user: any) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // 1. EXISTING USER: Check Role
      const role = userDoc.data().role;
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      // 2. NEW USER: Create "Youth" Profile
      await setDoc(userDocRef, {
        email: user.email,
        role: "youth", // Default role
        created_at: serverTimestamp(),
        name: user.displayName || name || "Youth Member", // Use Name from form or Google
        photo_url: user.photoURL || "",
      });
      navigate("/"); // Send new youth to Home
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Save their real name to Firebase Auth profile
        await updateProfile(userCredential.user, { displayName: name });
        // Create Firestore Profile
        await handleUserRouting(userCredential.user);
      } else {
        // --- SIGN IN LOGIC ---
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
      {/* Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-brand-accent/10 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
          alt="Youth Crowd"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="relative z-20 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="w-12 h-12 bg-brand-accent rounded-xl flex items-center justify-center font-bold text-brand-dark text-xl mb-6">
              YX
            </div>
            <h1 className="text-5xl font-display font-bold text-white mb-4">
              {isSignUp ? "JOIN THE\nFAMILY." : "WELCOME\nBACK."}
            </h1>
            <p className="text-brand-muted text-lg max-w-md">
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
              {/* NAME FIELD (Only visible when Signing Up) */}
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

          {/* TOGGLE SWITCH */}
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-brand-muted mb-2">
              {isSignUp
                ? "Already have an account?"
                : "Don't have an account yet?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(""); // Clear errors when switching
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
