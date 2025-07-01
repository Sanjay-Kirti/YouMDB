import React from 'react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-[#141414]">About YouMDB</h1>
      <p className="text-lg text-neutral-600 max-w-xl text-center">
        YouMDB is a platform to discover, review, and share your favorite YouTubers. Built with love by Sanjay Kirti, this site helps you find new creators, leave reviews, and connect with the YouTube community.
      </p>
    </div>
  );
} 