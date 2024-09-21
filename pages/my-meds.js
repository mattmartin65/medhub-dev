// pages/my-meds.js
import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import ClientLayout from '../components/ClientLayout';
import Card from '../components/Card';

export default function MyMeds() {
  const [medications, setMedications] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchMedications = async () => {
      console.log("Fetching medications from Supabase");
      const { data: medicationData, error: medicationError } = await supabase
        .from('medications')
        .select('id, name, description, imageUrl, modallogo, modaltitle, modaldescription, modalvideo, modalimage, modallinkcmi, modallinkcompany');

      if (medicationError) {
        console.error('Error fetching medications:', medicationError);
      } else {
        console.log('Fetched medications:', medicationData);
        setMedications(medicationData);

        if (medicationData.length > 0) {
          const medicationId = medicationData[0].id;
          console.log("Fetching programs for medication id:", medicationId);

          const { data: programData, error: programError } = await supabase
            .from('programs')
            .select('id, medication_id, name, description, imageurl, modallogo, modaltitle, modaldescription, modalvideo, modalimage, modallinkcmi, modallinkcompany')
            .eq('medication_id', medicationId);

          if (programError) {
            console.error('Error fetching programs:', programError);
          } else {
            console.log('Fetched programs:', programData);
            setPrograms(programData);
          }
        }
      }
    };

    fetchMedications();
  }, []);

  console.log("MyMeds rendering with medications:", medications);
  console.log("MyMeds rendering with programs:", programs);

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 pb-4 pt-4">
        <h1 className="text-2xl font-semibold mb-6 text-center text-slate-400"></h1>
        
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-center text-slate-700">Next Prescription Due</h2>
          <div className="bg-white p-4 pb-8 rounded-lg shadow-md mt-2">
            <div className="flex justify-between items-center text-xl text-slate-500">
              <span>Get ready</span>
              <span>5 days to go</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div className="bg-orange-400 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </section>

        {medications.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-center text-slate-600">Medication</h2>
            {medications.map((med) => (
              <Card
                key={med.id}
                title={med.name}
                description={med.description}
                imageUrl={med.imageUrl}
                modalLogo={med.modallogo}
                modalTitle={med.modaltitle}
                modalDescription={med.modaldescription}
                modalVideo={med.modalvideo}
                modalImage={med.modalimage}
                modalLinkCmi={med.modallinkcmi}
                modalLinkCompany={med.modallinkcompany}
              />
            ))}
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-center text-slate-600">Programs</h2>
            {programs.length > 0 ? (
              programs.map((prog) => (
                <Card
                  key={prog.id}
                  title={prog.name}
                  description={prog.description}
                  imageUrl={prog.imageurl}
                  modalLogo={prog.modallogo}
                  modalTitle={prog.modaltitle}
                  modalDescription={prog.modaldescription}
                  modalVideo={prog.modalvideo}
                  modalImage={prog.modalimage}
                  modalLinkCmi={prog.modallinkcmi}
                  modalLinkCompany={prog.modallinkcompany}
                />
              ))
            ) : (
              <p>No programs found for this medication.</p>
            )}
          </div>
        ) : (
          <p>No medications found.</p>
        )}
      </div>
    </ClientLayout>
  );
}