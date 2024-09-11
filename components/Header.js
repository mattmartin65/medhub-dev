// components/Header.js
import { useSession } from '@supabase/auth-helpers-react';
import { FaClinicMedical } from 'react-icons/fa';
import { useEffect } from 'react';

export default function Header({ clinicName, clinicAddress, headerUrl, icon }) {
  const session = useSession();
  const userName = session?.user?.user_metadata?.full_name || 'User';

  useEffect(() => {
    console.log('Header rendered with URL:', headerUrl);
  }, [headerUrl]);

  return (
    <header
      className="fixed top-0 left-0 w-full h-52 bg-cover bg-left-top text-white z-10"
      style={{ backgroundImage: `url(${headerUrl})`, paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="relative z-10 flex items-center justify-start px-6 h-full">
        <div className="flex items-center mb-4 bg-white bg-opacity-50 rounded-lg p-2 mr-4">
          {icon ? (
            <img src={icon} alt="Clinic Icon" className="h-14 w-100% rounded-md" />
          ) : (
            <FaClinicMedical className="text-5xl text-gray-800" />
          )}
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-semibold text-gray-400">{clinicName}</h1>
          <p className="text-md text-gray-400">{clinicAddress}</p>
          <div className="text-md mt-0 text-gray-400">Welcome, {userName}</div>
        </div>
      </div>
    </header>
  );
}