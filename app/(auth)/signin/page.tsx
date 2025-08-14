"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/utils/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import SuccessToast from "@/components/SuccessToast"; // Import SuccessToast component
import { setCookie } from "cookies-next";


const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false); // State to trigger the success toast

    const router = useRouter();

    const handleLogin = async () => {
        setError("");
        setLoading(true);
      
        try {
          // Sign in the user with Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
      
          // Fetch the user document from Firestore
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
      
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role;
      
            // Store the authentication token in cookies
            const token = await user.getIdToken();
            console.log("Generated Token:", token); // Debug log for token
            setCookie("authToken", token, {
              maxAge: 24 * 60 * 60, // 1 day
              httpOnly: false, // Set to false for client-side usage
              sameSite: "strict",
            });
            console.log("Cookie Set Successfully"); // Debug log for cookie setting
        
      
            // Redirect based on user role
            if (userRole === "student") {
              router.push("/appointment"); // Redirect to student appointment page
            } else if (userRole === "faculty") {
              router.push("/appointment/requests"); // Redirect to faculty requests page
            } else {
              setError("User role not recognized.");
            }
      
            // Trigger success toast when user logs in
            setShowToast(true);
          } else {
            setError("User data not found in Firestore.");
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred.");
          }
        } finally {
          setLoading(false);
        }
      }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d9601f] to-[#393637] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-[#d9601f]/20 to-transparent opacity-60 blur-3xl"></div>

            {/* ✅ Success Toast */}
            <SuccessToast 
                message="User logged in successfully!" 
                visible={showToast} 
                onClose={() => setShowToast(false)} // Close toast after some time
            />

            <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 shadow-2xl rounded-xl relative z-10"
            >
                <h2 className="text-3xl text-center text-[#874300] mb-6">Welcome Back</h2>
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                    className="space-y-4"
                >
                    <input 
                        type="email" 
                        placeholder="Your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-transparent border border-gray-300 rounded text-white placeholder-gray-100"
                    />
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Your password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-transparent border border-gray-300 rounded text-white placeholder-gray-100"
                        />
                        <div 
                            className="absolute right-15 inset-y-0 flex items-center cursor-pointer"
                            onMouseEnter={() => setShowPassword(true)}
                            onMouseLeave={() => setShowPassword(false)}
                        >
                            {showPassword ? <EyeOff color="white" /> : <Eye color="white" />}
                        </div>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-400 hover:underline">
                            <Link href="/auth/reset-password">Forgot?</Link>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-[#d9601f] text-white p-3 rounded hover:bg-[#393637] transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Sign In"}
                    </button>
                </form>

                <div className="text-center text-white mt-4">or</div>
                <button 
                    className="w-full bg-gray-800 text-white p-3 rounded hover:bg-gray-700 transition-colors"
                >
                    Sign In with Google
                </button>

                <div className="text-center text-sm text-gray-400 mt-6">
                    Don’t have an account? <Link href="/signup" className="text-blue-400 hover:underline">Sign Up</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
