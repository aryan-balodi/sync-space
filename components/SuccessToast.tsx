// components/SuccessToast.tsx
'use client';

import dynamic from 'next/dynamic';
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  {
    ssr: false,
  }
);

import { useGLTF, useAnimations } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, useEffect } from 'react';

type SuccessToastProps = {
  message: string;
  onClose: () => void;
  visible: boolean;
};

const TickModel = () => {
  const gltf = useGLTF('/models/tick.glb');
  const { actions } = useAnimations(gltf.animations, gltf.scene);

  useEffect(() => {
    if (actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.reset().play();
      }
    }
  }, [actions]);

  return <primitive object={gltf.scene} scale={18} position={[0, -0.2, 0]} />;
};

export default function SuccessToast({
  message,
  onClose,
  visible,
}: SuccessToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed right-6 bottom-6 z-50 flex items-center space-x-2 rounded-lg border border-green-400 bg-white px-6 py-4 shadow-xl"
        >
          <div className="ml-1 h-12 w-12">
            <Canvas camera={{ position: [0, 0, 4] }}>
              <ambientLight intensity={0.9} />
              <directionalLight position={[2, 2, 5]} />
              <Suspense fallback={null}>
                <TickModel />
              </Suspense>
            </Canvas>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg font-medium text-green-700"
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

useGLTF.preload('/models/tick.glb');
