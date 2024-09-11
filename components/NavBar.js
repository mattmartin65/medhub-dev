// components/NavBar.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { FaPills, FaBell, FaClinicMedical, FaSignOutAlt } from "react-icons/fa";

export default function NavBar() {
  console.log("Rendering NavBar");
  const pathname = usePathname();
  const supabase = useSupabaseClient();
  const session = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // Use window.location.href for redirect
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 border-t border-gray-200 shadow-lg z-50 h-24">
      <ul className="flex justify-around items-center h-full text-primary">
        <li
          className={`${
            pathname === "/my-meds"
              ? "text-primary font-semibold"
              : "text-secondary"
          } hover:text-accent flex flex-col items-center`}
        >
          <Link href="/my-meds" className="flex flex-col items-center">
            <FaPills className="text-2xl mb-1" />
            <span>My Meds</span>
          </Link>
        </li>
        <li
          className={`${
            pathname === "/remind-me"
              ? "text-primary font-semibold"
              : "text-secondary"
          } hover:text-accent flex flex-col items-center`}
        >
          <Link href="/remind-me" className="flex flex-col items-center">
            <FaBell className="text-2xl mb-1" />
            <span>Remind Me</span>
          </Link>
        </li>
        <li
          className={`${
            pathname === "/my-clinic"
              ? "text-primary font-semibold"
              : "text-secondary"
          } hover:text-accent flex flex-col items-center`}
        >
          <Link href="/my-clinic" className="flex flex-col items-center">
            <FaClinicMedical className="text-2xl mb-1" />
            <span>My Clinic</span>
          </Link>
        </li>
        {session && (
          <li className="hover:text-accent flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="flex flex-col items-center text-primary"
            >
              <FaSignOutAlt className="text-2xl mb-1" />
              <span>Logout</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
