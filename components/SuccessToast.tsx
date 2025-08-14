// components/SuccessToast.tsx
"use client";

import dynamic from "next/dynamic";
const Canvas = dynamic(() => import("@react-three/fiber").then(mod => mod.Canvas), {
  ssr: false
});

import { useGLTF, useAnimations } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useEffect } from "react";

type SuccessToastProps = {
  message: string;
  onClose: () => void;
  visible: boolean;
};

const TickModel = () => {
  const gltf = useGLTF("/models/tick.glb");
  const { actions } = useAnimations(gltf.animations, gltf.scene);

  useEffect(() => {
    if (actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.reset().play();
      }
    }
  }, [actions]);

  return (
    <primitive object={gltf.scene} scale={18} position={[0, -0.2, 0]} />
  );
};

export default function SuccessToast({ message, onClose, visible }: SuccessToastProps) {
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
          className="fixed bottom-6 right-6 z-50 bg-white shadow-xl rounded-lg px-6 py-4 flex items-center space-x-2 border border-green-400"
        >
          <div className="w-12 h-12 ml-1">
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
            className="text-green-700 font-medium text-lg"
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

useGLTF.preload("/models/tick.glb");
