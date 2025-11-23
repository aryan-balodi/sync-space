'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import SuccessToast from '@/components/SuccessToast'; // Import SuccessToast component
import { setCookie } from 'cookies-next';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false); // State to trigger the success toast

  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Sign in the user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch the user document from Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        // Store the authentication token in cookies
        const token = await user.getIdToken();
        console.log('Generated Token:', token); // Debug log for token
        setCookie('authToken', token, {
          maxAge: 24 * 60 * 60, // 1 day
          httpOnly: false, // Set to false for client-side usage
          sameSite: 'strict',
        });
        console.log('Cookie Set Successfully'); // Debug log for cookie setting

        // Redirect based on user role
        if (userRole === 'student') {
          router.push('/appointment'); // Redirect to student appointment page
        } else if (userRole === 'faculty') {
          router.push('/appointment/requests'); // Redirect to faculty requests page
        } else {
          setError('User role not recognized.');
        }

        // Trigger success toast when user logs in
        setShowToast(true);
      } else {
        setError('User data not found in Firestore.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#d9601f] to-[#393637]">
      <div className="bg-gradient-radial absolute inset-0 from-[#d9601f]/20 to-transparent opacity-60 blur-3xl"></div>

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
        className="relative z-10 w-full max-w-md rounded-xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg"
      >
        <h2 className="mb-6 text-center text-3xl text-[#874300]">
          Welcome Back
        </h2>
        {error && <div className="mb-4 text-center text-red-500">{error}</div>}

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
            className="w-full rounded border border-gray-300 bg-transparent p-3 text-white placeholder-gray-100"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 bg-transparent p-3 text-white placeholder-gray-100"
            />
            <div
              className="absolute inset-y-0 right-15 flex cursor-pointer items-center"
              onMouseEnter={() => setShowPassword(true)}
              onMouseLeave={() => setShowPassword(false)}
            >
              {showPassword ? <EyeOff color="white" /> : <Eye color="white" />}
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2 transform text-sm text-blue-400 hover:underline">
              <Link href="/auth/reset-password">Forgot?</Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded bg-[#d9601f] p-3 text-white transition-colors hover:bg-[#393637]"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-white">or</div>
        <button className="w-full rounded bg-gray-800 p-3 text-white transition-colors hover:bg-gray-700">
          Sign In with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
