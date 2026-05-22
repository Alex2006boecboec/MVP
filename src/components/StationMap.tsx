"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useMemo } from "react";

interface StationPin {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  availableCount: number;
}

interface Props {
  stations: StationPin[];
  height?: number;
}

export default function StationMap({ stations, height = 480 }: Props) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "musicrent-marker",
        html: `<div style="
          background:#e11d48;
          color:white;
          width:34px;
          height:34px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:bold;
          border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
        ">♪</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      }),
    [],
  );

  const center: [number, number] = stations.length
    ? [
        stations.reduce((s, st) => s + st.lat, 0) / stations.length,
        stations.reduce((s, st) => s + st.lng, 0) / stations.length,
      ]
    : [55.7558, 37.6173];

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={icon as L.DivIcon}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{station.name}</div>
                <div className="text-xs text-slate-500">{station.address}</div>
                <div className="text-sm">
                  Доступно плееров:{" "}
                  <b className={station.availableCount > 0 ? "text-emerald-600" : "text-slate-400"}>
                    {station.availableCount}
                  </b>
                </div>
                <Link
                  href={`/stations/${station.id}`}
                  className="text-brand-600 text-sm hover:underline"
                >
                  Открыть станцию →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
