// components/Card.js
import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function Card({ title, description, imageUrl, modalLogo, modalTitle, modalDescription, modalVideo, modalImage, modalLinkCmi, modalLinkCompany }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('Card rendered with image URL:', imageUrl);
  }, [imageUrl]);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div
        onClick={handleCardClick}
        className="bg-white shadow rounded-2xl transition-transform transform hover:scale-105 cursor-pointer"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="rounded-t-2xl w-full h-70 object-cover"
          />
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
          <p className="text-gray-500">{description}</p>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modalLogo={modalLogo}
        modalTitle={modalTitle}
        modalDescription={modalDescription}
        modalVideo={modalVideo}
        modalImage={modalImage}
        modalLinkCmi={modalLinkCmi}
        modalLinkCompany={modalLinkCompany}
      />
    </div>
  );
}