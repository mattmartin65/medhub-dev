// components/ListCards.js
import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';
import Modal from './Modal';

const ListCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from('task-list')
        .select('task-name, task-image, frequency-days, task-description, additional-information, frequency, category');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Fetched data:', data);
        setCards(data);
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
      {cards.length === 0 ? (
        <div>No data available</div>
      ) : (
        cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden mb-4 flex">
            <div className="w-1/4" onClick={() => openModal(card)}>
              {card['task-image'] && (
                <img src={card['task-image']} alt={card['task-name']} className="h-full w-full object-cover rounded-l-lg" />
              )}
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between" onClick={() => openModal(card)}>
              <div>
                <h2 className="text-xl text-gray-600 font-semibold mb-2">{card['task-name']}</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Frequency Days: {card['frequency-days']}</p>
                </div>
              </div>
            </div>
            <div className="w-auto">
              <button
                className="text-xl font-bold bg-primary text-gray-200 px-4 pb-2 rounded-r-lg h-full flex items-center justify-center"
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
          modalTitle={selectedCard['task-name']}
          modalDescription={selectedCard['task-description']}
          modalAdditionalInfo={selectedCard['additional-information']}
          modalFrequency={selectedCard['frequency']}
          modalCategory={selectedCard['category']}
          modalImage={selectedCard['task-image']}
          // Add other modal properties as needed
        />
      )}
    </div>
  );
};

export default ListCards;