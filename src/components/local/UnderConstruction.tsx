"use client";

export default function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-yellow-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold mb-2">Page Under Construction</h1>
        <p className="text-gray-600">
          We're working hard to bring this page to life. Check back soon!
        </p>
      </div>
    </div>
  );
}

