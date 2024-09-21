// components/ListCards.js
import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';
import Modal from './Modal';

const ListCards = () => {
  const [cards, setCards] = useState([]);
  const [specialistAppointment, setSpecialistAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from('reminder-list')
        .select('name, image, frequency-days, description, additional-information, frequency');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Fetched data:', data);
        // Find the specialist appointment card
        const specialistCard = data.find(card => card.name.toLowerCase().includes('specialist appointment'));
        setSpecialistAppointment(specialistCard);
        // Filter out the specialist appointment from the regular cards
        setCards(data.filter(card => card !== specialistCard));
      }
      setLoading(false);
    };

    fetchCards();
  }, []);

  const openModal = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling when modal is open
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    document.body.style.overflow = 'unset'; // Re-enable scrolling when modal is closed
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-0 sm:p-4">
      {specialistAppointment && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex flex-col">
            <div className="w-full h-56 overflow-hidden" onClick={() => openModal(specialistAppointment)}>
              {specialistAppointment['image'] && (
                <img 
                  src={specialistAppointment['image']} 
                  alt={specialistAppointment['name']} 
                  className="w-full h-auto object-cover object-top"
                />
              )}
            </div>
            <div className="p-6 flex flex-col" onClick={() => openModal(specialistAppointment)}>
              <h2 className="text-2xl text-gray-800 font-bold mb-3">{specialistAppointment['name']}</h2>
              <p className="text-gray-600 mb-4">{specialistAppointment['description']}</p>
              <p className="text-sm text-gray-500 mt-auto">Frequency Days: {specialistAppointment['frequency-days']}</p>
            </div>
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div>No other reminders available</div>
      ) : (
        cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden mb-4 flex">
            <div className="w-1/4" onClick={() => openModal(card)}>
              {card['image'] && (
                <img src={card['image']} alt={card['name']} className="h-full w-full object-cover rounded-l-lg" />
              )}
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between" onClick={() => openModal(card)}>
              <div>
                <h2 className="text-xl text-gray-600 font-semibold mb-2">{card['name']}</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Frequency Days: {card['frequency-days']}</p>
                </div>
              </div>
            </div>
            <div className="w-auto">
              <button
                className="text-xl font-bold bg-primary text-gray-200 px-6 pb-2 rounded-r-lg h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking the Done button
              >
                Done
              </button>
            </div>
          </div>
        ))
      )}

      {selectedCard && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          modalTitle={selectedCard['name']}
          modalDescription={selectedCard['description']}
          modalAdditionalInfo={selectedCard['additional-information']}
          modalFrequency={selectedCard['frequency']}
          modalImage={selectedCard['image']}
          // Remove modalCategory as it's not in the schema
        />
      )}
    </div>
  );
};

export default ListCards;