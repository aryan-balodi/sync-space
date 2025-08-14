"use client";

import { useState, useEffect } from "react";
import { DatePicker, TimePicker, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { db } from "@/utils/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth } from "@/utils/firebaseConfig";
import SuccessToast from "@/components/SuccessToast"; // Import SuccessToast component
import { useRouter } from "next/navigation"; // Import router for redirection
import { onAuthStateChanged } from "firebase/auth";

const AppointmentBookingPage = () => {
  const [faculty, setFaculty] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [facultyList, setFacultyList] = useState<{ id: string; name: string }[]>(
    []
  );
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [showToast, setShowToast] = useState(false); // State for success toast
  const router = useRouter(); // Router for redirection

  // Track the currently logged-in user and validate their role
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
  
          // Fetch user role from Firestore
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
  
          if (userDoc.exists()) {
            const userRole = userDoc.data()?.role;
  
            if (userRole !== "student") {
              // Redirect students or unauthorized users to `/appointment`
              router.push("/appointment/requests");
            }
          } else {
            console.error("User data not found in Firestore.");
            router.push("/signin"); // Redirect to sign-in if user data is missing
          }
        } else {
          router.push("/signin"); // Redirect to sign-in if not authenticated
        }
      });
  
      return () => unsubscribe();
    }, [router]);


  // Fetch faculty members
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const facultyUsers = querySnapshot.docs
          .map((doc) => {
            const data = doc.data() as { name: string; role: string };
            return { id: doc.id, ...data };
          })
          .filter((user) => user.role === "faculty");

        setFacultyList(facultyUsers);
      } catch (error) {
        console.error("Error fetching faculty:", error);
      }
    };

    fetchFaculty();
  }, []);

  // Handle appointment booking
  const handleBooking = async () => {
    if (!faculty || !date || !time || !duration) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "appointmentRequests"), {
        faculty,
        studentName: auth.currentUser?.displayName || "Unknown Student",
        reason: "No reason provided", // static for now
        date: date.format("YYYY-MM-DD"),
        time: time.format("HH:mm"),
        duration: Number(duration),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Trigger the success toast
      setShowToast(true);
      // Reset form
      setFaculty("");
      setDate(null);
      setTime(null);
      setDuration("");
    } catch (error) {
      console.error("Error booking appointment: ", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#d9601f" } }}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#d9601f] to-[#393637] relative">
        {/* Navigation Tabs */}
        <div className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-md z-10">
          <div className="container mx-auto px-4 py-2">
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => router.push("/appointment")}
                className="px-5 py-3 rounded-t-lg transition-colors bg-white text-[#d9601f] font-medium"
              >
                Appointment Booking
              </button>
              <button
                onClick={() => router.push("/appointment/resource-blocking")}
                className="px-5 py-3 rounded-t-lg transition-colors bg-black/10 text-white hover:bg-black/30"
              >
                Resource Blocking
              </button>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        <SuccessToast
          message="Appointment request sent successfully!"
          visible={showToast}
          onClose={() => setShowToast(false)}
        />

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 pt-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Appointment Booking Portal
          </h1>
          <p className="text-white/80">
            Schedule your meetings with professors effortlessly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-3xl bg-white p-10 rounded-xl shadow-2xl flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-6 transform hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all"
        >
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Faculty
              </label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
              >
                <option value="">-- Choose a Faculty Member --</option>
                {facultyList.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (in minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder="Enter duration"
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <DatePicker className="w-full" onChange={(date) => setDate(date)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Time
              </label>
              <TimePicker className="w-full" onChange={(time) => setTime(time)} />
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={handleBooking}
          className="mt-8 bg-[#d9601f] text-white px-6 py-3 rounded-lg hover:bg-[#393637] transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          Confirm Booking
        </motion.button>
      </div>
    </ConfigProvider>
  );
};

export default AppointmentBookingPage;
