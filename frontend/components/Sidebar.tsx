import React from 'react';
import Link from "next/link";
import Image from "next/image";
const navLinks = [
  { href: "/patients", label: "Patients" },
  { href: "/medications", label: "Medications" },
  { href: "/assignments", label: "Assignments" },
];

export function Sidebar() {
  return (
    <nav aria-label="Main navigation" className="bg-gray-800 text-white w-full md:w-60 md:min-h-screen flex md:flex-col flex-row items-center md:items-stretch">
      <Image className="mx-auto w-16 h-16 mt-2 rounded-lg" src="/oxyera_logo.jpeg" alt="Oxyera Logo" width={64} height={64} />
      <div className="flex-1 flex md:flex-col flex-row w-full">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-3 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-center md:text-left w-full"
            tabIndex={0}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
} 