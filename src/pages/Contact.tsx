import React from 'react';

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
      <img
        src="https://avatars.githubusercontent.com/u/102298373?v=4"
        alt="Sanjay Kirti GitHub Profile"
        className="w-24 h-24 rounded-full border-4 border-neutral-200 object-cover mb-4"
      />
      <h1 className="text-2xl font-bold mb-2 text-[#141414]">Created by Sanjay Kirti</h1>
      <div className="flex gap-4 mb-4">
        <a href="https://github.com/Sanjay-Kirti" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
        </a>
        <a href="mailto:lukebrushwood@gmail.com" className="text-neutral-500 hover:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm0 12H4V8.99l8 6.99 8-6.99V18z"/></svg>
        </a>
      </div>
      <div className="text-neutral-600 text-lg">Email: <a href="mailto:lukebrushwood@gmail.com" className="underline">lukebrushwood@gmail.com</a></div>
    </div>
  );
} 