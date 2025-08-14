"use client";

import { useState, useEffect } from "react";
import { DatePicker, TimePicker, ConfigProvider, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { db } from "@/utils/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import SuccessToast from "@/components/SuccessToast";

const { Option } = Select;

const ResourceBlockingPage = () => {
  const [resourceType, setResourceType] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [purpose, setPurpose] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const router = useRouter();

  // Fetch resources dynamically from Firestore
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "resources"));
        const fetchedResources = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResources(fetchedResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  const handleSubmit = async () => {
    if (!resourceType || !location || !date || !startTime || !endTime || !purpose) {
      alert("Please fill in all fields.");
      return;
    }

    if (endTime?.isBefore(startTime)) {
      alert("End time must be after start time.");
      return;
    }

    try {
      await addDoc(collection(db, "resourceBlocking-req"), {
        resourceType,
        location,
        date: date.format("YYYY-MM-DD"),
        startTime: startTime.format("HH:mm"),
        endTime: endTime.format("HH:mm"),
        purpose,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setShowToast(true);

      // Reset form fields
      setResourceType("");
      setLocation("");
      setDate(null);
      setStartTime(null);
      setEndTime(null);
      setPurpose("");
    } catch (error) {
      console.error("Error submitting booking request:", error);
      alert("An error occurred while submitting your booking request.");
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
                className="px-5 py-3 rounded-t-lg transition-colors bg-black/10 text-white hover:bg-black/30"
              >
                Appointment Booking
              </button>
              <button
                onClick={() => router.push("/appointment/resource-blocking")}
                className="px-5 py-3 rounded-t-lg transition-colors bg-white text-[#d9601f] font-medium"
              >
                Resource Blocking
              </button>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        <SuccessToast
          message="Resource booking request sent successfully!"
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
            Resource Reservation Portal
          </h1>
          <p className="text-white/80">
            Reserve auditoriums, board rooms, and classrooms with ease.
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
                Resource Type
              </label>
              <Select
                value={resourceType}
                onChange={(value) => setResourceType(value)}
                placeholder="Select a resource type"
                className="w-full"
              >
                {Array.from(new Set(resources.map((res) => res.resourceType))).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Select
                value={location}
                onChange={(value) => setLocation(value)}
                placeholder="Select location"
                className="w-full"
              >
                {Array.from(new Set(resources.map((res) => res.location))).map((loc) => (
                  <Option key={loc} value={loc}>
                    {loc}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <DatePicker className="w-full" onChange={(date) => setDate(date)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <TimePicker className="w-full" onChange={(time) => setStartTime(time)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <TimePicker className="w-full" onChange={(time) => setEndTime(time)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Reservation
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter the purpose of reservation"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={handleSubmit}
          className="mt-8 bg-[#d9601f] text-white px-6 py-3 rounded-lg hover:bg-[#393637] transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          Submit Reservation Request
        </motion.button>
      </div>
    </ConfigProvider>
  );
};

export default ResourceBlockingPage;
