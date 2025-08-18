
"use client"

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"

export default function Home() {
  const containerStyle = {
    width: "100%",
    height: "500px",
  }

  const center = {
    lat: 40.99864385925853,
    lng: 22.878476376223958,
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Find Us</h1>
      <LoadScript googleMapsApiKey={process.env.PUBLIC_GOOGLE_MAPS_KEY!}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </main>
  )
}
