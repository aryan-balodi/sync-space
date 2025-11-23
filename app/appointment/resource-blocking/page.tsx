'use client';

import { useState, useEffect } from 'react';
import { DatePicker, TimePicker, ConfigProvider, Select } from 'antd';
import { Dayjs } from 'dayjs';
import { motion } from 'framer-motion';
import { db } from '@/utils/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import SuccessToast from '@/components/SuccessToast';

const { Option } = Select;

interface Resource {
  id: string;
  resourceType: string;
  location: string;
}

const ResourceBlockingPage = () => {
  const [resourceType, setResourceType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [purpose, setPurpose] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const router = useRouter();

  // Fetch resources dynamically from Firestore
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'resources'));
        const fetchedResources = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResources(fetchedResources as Resource[]);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    fetchResources();
  }, []);

  const handleSubmit = async () => {
    if (
      !resourceType ||
      !location ||
      !date ||
      !startTime ||
      !endTime ||
      !purpose
    ) {
      alert('Please fill in all fields.');
      return;
    }

    if (endTime?.isBefore(startTime)) {
      alert('End time must be after start time.');
      return;
    }

    try {
      await addDoc(collection(db, 'resourceBlocking-req'), {
        resourceType,
        location,
        date: date.format('YYYY-MM-DD'),
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        purpose,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setShowToast(true);

      // Reset form fields
      setResourceType('');
      setLocation('');
      setDate(null);
      setStartTime(null);
      setEndTime(null);
      setPurpose('');
    } catch (error) {
      console.error('Error submitting booking request:', error);
      alert('An error occurred while submitting your booking request.');
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#d9601f' } }}>
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#d9601f] to-[#393637]">
        {/* Navigation Tabs */}
        <div className="absolute top-0 right-0 left-0 z-10 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/appointment')}
                className="rounded-t-lg bg-black/10 px-5 py-3 text-white transition-colors hover:bg-black/30"
              >
                Appointment Booking
              </button>
              <button
                onClick={() => router.push('/appointment/resource-blocking')}
                className="rounded-t-lg bg-white px-5 py-3 font-medium text-[#d9601f] transition-colors"
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
          className="mb-8 pt-16 text-center"
        >
          <h1 className="mb-4 text-5xl font-bold text-white">
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
          className="flex w-full max-w-3xl transform flex-col justify-between space-y-6 rounded-xl bg-white p-10 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] md:flex-row md:space-y-0 md:space-x-6"
        >
          <div className="flex-1 space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Resource Type
              </label>
              <Select
                value={resourceType}
                onChange={(value) => setResourceType(value)}
                placeholder="Select a resource type"
                className="w-full"
              >
                {Array.from(
                  new Set(resources.map((res) => res.resourceType))
                ).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Location
              </label>
              <Select
                value={location}
                onChange={(value) => setLocation(value)}
                placeholder="Select location"
                className="w-full"
              >
                {Array.from(new Set(resources.map((res) => res.location))).map(
                  (loc) => (
                    <Option key={loc} value={loc}>
                      {loc}
                    </Option>
                  )
                )}
              </Select>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>
              <DatePicker
                className="w-full"
                onChange={(date) => setDate(date)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <TimePicker
                className="w-full"
                onChange={(time) => setStartTime(time)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                End Time
              </label>
              <TimePicker
                className="w-full"
                onChange={(time) => setEndTime(time)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Purpose of Reservation
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter the purpose of reservation"
                rows={3}
                className="w-full rounded border border-gray-300 p-3"
              />
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={handleSubmit}
          className="mt-8 rounded-lg bg-[#d9601f] px-6 py-3 text-white transition-colors hover:bg-[#393637]"
          whileHover={{ scale: 1.05 }}
        >
          Submit Reservation Request
        </motion.button>
      </div>
    </ConfigProvider>
  );
};

export default ResourceBlockingPage;
