'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/utils/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import SuccessToast from '@/components/SuccessToast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      // ✅ Move domain validation before creating user
      const validDomains = ['@jaipur.manipal.edu', '@muj.manipal.edu'];
      const matchedDomain = validDomains.find((domain) =>
        email.endsWith(domain)
      );

      if (!matchedDomain) {
        setError(
          'Invalid Email Domain. Only MUJ or Faculty emails are allowed.'
        );
        setLoading(false);
        return;
      }

      const role =
        matchedDomain === '@jaipur.manipal.edu' ? 'faculty' : 'student';

      // ✅ Create User with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      // ✅ Save User Data to Firestore
      const userRef = doc(collection(db, 'users'), user.uid);
      await setDoc(userRef, {
        name: name,
        email: email,
        role: role,
      });

      setShowToast(true); // ✅ trigger success toast
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
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
        message="User registered successfully!"
        visible={showToast}
        onClose={() => setShowToast(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md rounded-xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg"
      >
        <h2 className="mb-6 text-center text-3xl text-[#874300]">
          Create an Account
        </h2>
        {error && <div className="mb-4 text-center text-red-500">{error}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 bg-transparent p-3 text-white placeholder-gray-100"
          />
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 bg-transparent p-3 text-white placeholder-gray-100"
            />
            <div
              className="absolute inset-y-0 right-3 flex cursor-pointer items-center"
              onMouseEnter={() => setShowPassword(true)}
              onMouseLeave={() => setShowPassword(false)}
            >
              {showPassword ? <EyeOff color="white" /> : <Eye color="white" />}
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded bg-[#d9601f] p-3 text-white transition-colors hover:bg-[#393637]"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-white">or</div>
        <button className="w-full rounded bg-gray-800 p-3 text-white transition-colors hover:bg-gray-700">
          Sign Up with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/signin" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
