"use client"

import React, { useMemo } from "react"
import stitchSvg from "@/assets/stitch-1.svg"

interface SeparatorProps {
  repeat?: number
  minAngle?: number
  maxAngle?: number
  size?: number
  className?: string
}

export default function StitchSeparator({
  repeat = 20,
  minAngle = -15,
  maxAngle = 15,
  size = 12,
  className = "",
}: SeparatorProps) {
  const angle = useMemo(
    () => Math.random() * (maxAngle - minAngle) + minAngle,
    [minAngle, maxAngle]
  )

  return (
    <div
      className={`mb-10 flex overflow-hidden justify-center ${className}`}
      style={{ transform: `rotate(${angle}deg)` }}
    >
      {Array.from({ length: repeat }).map((_, index) => (
          <img
          key={index}
          src={stitchSvg.src}
          alt="stitch"
          width={size}
          height={size}
          className="flex-shrink-0 m-0 p-0"
          style={{ display: "block" }}
        />
      ))}
    </div>
  )
}
