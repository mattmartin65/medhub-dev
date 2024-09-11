// components/ClientLayout.js
"use client";
import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import NavBar from "./NavBar";
import Header from "./Header";

export default function ClientLayout({ children }) {
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
        console.log('Fetched clinic info:', data); // Debugging
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

  console.log("ClientLayout rendering with clinicInfo:", clinicInfo);

  return (
    <div className="relative min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <Header
        clinicName={clinicInfo.clinicName}
        clinicAddress={clinicInfo.address}
        headerUrl={clinicInfo.headerUrl}
        icon={clinicInfo.icon}
      />
      <div className="pt-48 pb-24">{children}</div>
      <NavBar />
    </div>
  );
}