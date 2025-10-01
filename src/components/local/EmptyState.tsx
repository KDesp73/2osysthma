"use client";

import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "No content here",
  description = "It looks like there's nothing to show at the moment.",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-20 px-4 ${className}`}
    >
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
