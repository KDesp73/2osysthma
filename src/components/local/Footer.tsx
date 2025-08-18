import React from "react";
import SocialButtons from "./SocialButtons";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-sm text-gray-600 select-none">
          &copy; {new Date().getFullYear()} 2ο Σύστημα Προσκόπων Κιλκίς. All rights reserved.
        </p>

        <nav className="flex space-x-6 text-sm text-gray-600">
          <a
            href="https://www.freeprivacypolicy.com/live/ff973a26-6553-412d-80cf-ff3f4b406744"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f08e7f] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.freeprivacypolicy.com/live/487bdc5b-283f-4acc-b7d8-20f6821ca5fd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f08e7f] transition-colors"
          >
            Terms of Service
          </a>
        </nav>
        <SocialButtons />
      </div>
    </footer>
  );
}

