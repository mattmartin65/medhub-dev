// pages/my-meds.js
import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import ClientLayout from '../components/ClientLayout';
import Card from '../components/Card';

export default function MyMeds() {
  const [medications, setMedications] = useState([]);
  const [headerUrl, setHeaderUrl] = useState('');

  useEffect(() => {
    const fetchMedications = async () => {
      const { data: medicationData, error: medicationError } = await supabase
        .from('medications')
        .select('id, name, description, imageUrl'); // Ensure imageUrl is fetched

      if (medicationError) {
        console.error('Error fetching medications:', medicationError);
      } else {
        setMedications(medicationData);
      }
    };

    const fetchHeaderUrl = async () => {
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinic')
        .select('headerUrl')
        .single();

      if (clinicError) {
        console.error('Error fetching clinic data:', clinicError);
      } else if (clinicData) {
        console.log('Fetched headerUrl:', clinicData.headerUrl); // Debugging
        setHeaderUrl(clinicData.headerUrl);
      }
    };

    fetchMedications();
    fetchHeaderUrl();
  }, []);

  console.log("MyMeds rendering with headerUrl:", headerUrl);

  return (
    <ClientLayout headerUrl={headerUrl}>
      <div className="container mx-auto p-4">
        {medications.map((med) => (
          <Card
            key={med.id}
            title={med.name}
            description={med.description}
            imageUrl={med.imageUrl} // Use imageUrl for the card
            content={<p>More detailed information about {med.name}.</p>}
          >
            <p>Additional content for {med.name}.</p>
          </Card>
        ))}
      </div>
    </ClientLayout>
  );
}