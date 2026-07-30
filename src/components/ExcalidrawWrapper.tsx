"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import Excalidraw to ensure it only renders on the client side
// as it depends on window/document APIs.
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-500">
        Memuat Kanvas...
      </div>
    ),
  }
);

interface ExcalidrawWrapperProps {
  initialData?: any;
}

export default function ExcalidrawWrapper({ initialData }: ExcalidrawWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="h-full w-full">
      <Excalidraw initialData={initialData} />
    </div>
  );
}
