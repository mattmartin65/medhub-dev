// components/ClientLayout.js
"use client";
import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import Header from "./Header";
import NavBar from "./NavBar";  // Import the NavBar component instead of BottomNav

const ClientLayout = ({ children }) => {
  const [clinicInfo, setClinicInfo] = useState({
    clinicName: '',
    address: '',
    headerUrl: '',
    icon: '',
  });

  useEffect(() => {
    const fetchClinicInfo = async () => {
      const { data, error } = await supabase
        .from('clinic')
        .select('clinicName, address, headerUrl, icon')
        .single();

      if (error) {
        console.error('Error fetching clinic info:', error);
      } else if (data) {
        console.log('Fetched clinic info:', data);
        setClinicInfo({
          clinicName: data.clinicName,
          address: data.address,
          headerUrl: data.headerUrl,
          icon: data.icon,
        });
      }
    };

    fetchClinicInfo();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        clinicName={clinicInfo.clinicName}
        clinicAddress={clinicInfo.address}
        headerUrl={clinicInfo.headerUrl}
        icon={clinicInfo.icon}
      />
      <main className="flex-grow pt-20"> {/* Increased padding-top */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-10" style={{ maxWidth: '736px' }}> {/* Added pt-10 for extra top padding */}
          {children}
        </div>
      </main>
      <NavBar />  {/* Use the NavBar component here */}
    </div>
  );
};

export default ClientLayout;