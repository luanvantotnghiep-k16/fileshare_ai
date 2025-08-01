import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow py-4 px-6 flex items-center justify-between">
      <div className="text-xl font-bold text-blue-700">
        <Link href="/">Secure FileShare</Link>
      </div>
      <nav className="flex gap-4">
        <Link href="/" className="hover:underline">Upload</Link>
        <Link href="/received" className="hover:underline">Received</Link>
        <Link href="/profile" className="hover:underline">Profile</Link>
        <button
          className="ml-4 text-red-600 hover:underline"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
