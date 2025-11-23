'use client';

import { useEffect, useRef, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/utils/useAuth';
import { deleteCookie } from 'cookies-next'; // Import cookies-next for cookie management

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // For click-outside detection
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(getAuth()); // Sign out the user from Firebase
      deleteCookie('authToken'); // Clear the authentication token cookie
      router.push('/signin'); // Redirect to sign-in page after logout
    } catch (err) {
      // Explicitly narrow the type of `err`
      if (err instanceof Error) {
        console.error('Sign out failed:', err.message);
      } else {
        console.error('An unknown error occurred during sign out.');
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isLoggedIn) return null;

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Profile Circle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9601f] font-bold text-white shadow-lg transition hover:scale-105"
        title="User Profile"
      >
        {user?.displayName?.[0] ?? 'U'}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-xl">
          <p className="text-sm font-semibold text-white">
            {user?.displayName ?? 'Unnamed User'}
          </p>
          <p className="truncate text-xs text-gray-400">{user?.email}</p>

          <button
            onClick={handleSignOut} // Logout logic added here
            className="mt-4 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
          >
            <span>Logout</span>
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
