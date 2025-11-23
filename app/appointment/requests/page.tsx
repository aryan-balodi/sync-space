'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import router for redirection
import { db, auth } from '@/utils/firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  QueryDocumentSnapshot,
  DocumentData,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createEvent } from 'ics';

interface AppointmentRequest {
  id: string;
  studentName: string;
  faculty: string;
  date: string;
  time: string;
  reason: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected';
  icsContent?: string; // Optional property for storing ICS content
}

export default function AppointmentRequestsPage() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // State for loading animation
  const router = useRouter(); // Router for redirection

  // Track the currently logged-in user and validate their role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Fetch user role from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userRole = userDoc.data()?.role;

          if (userRole !== 'faculty') {
            // Redirect students or unauthorized users to `/appointment`
            router.push('/appointment');
          }
        } else {
          console.error('User data not found in Firestore.');
          router.push('/signin'); // Redirect to sign-in if user data is missing
        }
      } else {
        router.push('/signin'); // Redirect to sign-in if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch requests specific to the current faculty member
  const fetchRequests = async (facultyName: string) => {
    setLoading(true); // Start loading animation
    try {
      const snapshot = await getDocs(collection(db, 'appointmentRequests'));
      const fetched: AppointmentRequest[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as AppointmentRequest[];

      // Filter requests to only show those related to the logged-in faculty
      const filtered = fetched.filter((req) => req.faculty === facultyName);
      setRequests(filtered);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRequests(currentUser.displayName || '');
    }
  }, [currentUser]);

  // Function to generate an ICS file
  const generateICSFile = async (appointment: AppointmentRequest) => {
    const { faculty, date, time, duration, reason } = appointment;

    // Parse date and time into ICS format
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    return new Promise<string>((resolve, reject) => {
      createEvent(
        {
          title: `Appointment with ${faculty}`,
          description: reason,
          start: [year, month, day, hour, minute],
          duration: { minutes: duration },
          location: 'Manipal University Jaipur',
          organizer: { name: faculty },
        },
        (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value); // Return the ICS content as a string
          }
        }
      );
    });
  };

  // Function to update the status of the appointment request (approve/reject)
  const updateStatus = async (
    id: string,
    newStatus: 'approved' | 'rejected',
    request: AppointmentRequest
  ) => {
    const requestRef = doc(db, 'appointmentRequests', id);

    try {
      // Update the status of the request
      await updateDoc(requestRef, { status: newStatus });

      // If approved, add to approvedAppointments collection and generate ICS file
      if (newStatus === 'approved') {
        const approvedAppointmentsRef = collection(db, 'approvedAppointments');
        await addDoc(approvedAppointmentsRef, {
          studentName: request.studentName,
          faculty: request.faculty,
          date: request.date,
          time: request.time,
          duration: request.duration,
          reason: request.reason || '',
          status: 'approved',
        });

        // Generate ICS file content and store it in the appointment object
        const icsContent = await generateICSFile(request);
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: newStatus, icsContent } : req
          )
        );
      } else {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: newStatus } : req
          )
        );
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  // Function to download ICS file
  const downloadICSFile = (icsContent?: string, filename?: string) => {
    if (!icsContent || !filename) return;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="grid min-h-screen grid-cols-5 gap-6 bg-gradient-to-br from-[#d9601f] to-[#393637] px-4 pt-16 pb-10 md:px-12">
      {/* Increased padding-top from pt-10 to pt-24 */}

      {/* Appointment Requests Section */}
      <div className="col-span-1 rounded-lg bg-white/30 p-6 backdrop-blur-lg">
        <h1 className="mb-6 text-2xl font-semibold text-white">
          Appointment Requests
        </h1>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            {/* Modern Loading Animation */}
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-blue-400"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-yellow-400 delay-150"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-green-400 delay-300"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="group transform overflow-hidden rounded-xl bg-white p-4 shadow-lg transition-all duration-300 ease-in-out hover:h-auto hover:max-h-[500px]"
              >
                <p className="mb-1 font-medium text-gray-800">
                  {req.date} at {req.time}
                </p>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    req.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : req.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {req.status.toUpperCase()}
                </span>

                {/* Expanded details on hover */}
                <div className="mt-3 max-h-0 opacity-0 transition-all duration-300 ease-in-out group-hover:max-h-[300px] group-hover:opacity-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Student:</span>{' '}
                    {req.studentName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Duration:</span>{' '}
                    {req.duration} mins
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Reason:</span>{' '}
                    {req.reason || 'No reason provided'}
                  </p>

                  {/* Approve/Reject Buttons */}
                  {req.status === 'pending' && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => updateStatus(req.id, 'approved', req)}
                        className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                      >
                        Approve & Generate ICS
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'rejected', req)}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Download Button for Approved Appointments */}
                  {req.status === 'approved' && req.icsContent && (
                    <button
                      onClick={() =>
                        downloadICSFile(
                          req.icsContent!,
                          `${req.studentName}_appointment.ics`
                        )
                      }
                      className="mt-3 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                      Download Appointment (.ICS)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="col-span-4 rounded-lg bg-white/30 p-6 backdrop-blur-lg">
        <h2 className="mb-4 text-xl font-semibold text-white">Your Calendar</h2>
        <div className="rounded-xl bg-white p-5 shadow-lg">
          {/* Static Calendar */}
          <div className="calendar grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
            {[...Array(30)].map((_, idx) => (
              <div
                key={idx}
                className="flex h-16 items-center justify-center rounded-md bg-gray-100 text-sm font-medium text-gray-800"
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
