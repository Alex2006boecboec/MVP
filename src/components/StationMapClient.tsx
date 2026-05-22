"use client";

import dynamic from "next/dynamic";

const StationMap = dynamic(() => import("./StationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">
      Загружаем карту...
    </div>
  ),
});

interface StationPin {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  availableCount: number;
}

export default function StationMapClient({ stations }: { stations: StationPin[] }) {
  return <StationMap stations={stations} />;
}
