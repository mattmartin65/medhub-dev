// components/Modal.js
import React, { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, modalLogo, modalTitle, modalDescription, modalAdditionalInfo, modalFrequency, modalCategory, modalVideo, modalImage, modalLinkCmi, modalLinkCompany }) {
  const modalRef = useRef();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        style={{ height: '80%' }}
        className="w-full bg-white rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out max-w-3xl mx-auto"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-4xl"
          >
            &times;
          </button>
        </div>
        <div className="p-4 h-5/6 overflow-y-auto">
          {modalLogo && <img src={modalLogo} alt="Modal Logo" className="mb-4 w-100% h-16" />}
          <p className="mb-4">{modalDescription}</p>
          <p className="mb-4">{modalAdditionalInfo}</p>
          <p className="mb-4">Frequency: {modalFrequency}</p>
          <p className="mb-4">Category: {modalCategory}</p>
          {modalVideo && (
            <div className="flex justify-center my-4">
              <div className="rounded-lg overflow-hidden" style={{ width: '512px', height: '288px' }}>
                <iframe 
                  src={modalVideo} 
                  title={modalTitle} 
                  className="w-full h-full" 
                  style={{ borderRadius: '0.5rem', overflow: 'hidden' }} 
                />
              </div>
            </div>
          )}
          {modalImage && <img src={modalImage} alt="Modal" className="w-full h-64 object-cover my-4 rounded-lg" />}
          <div className="flex justify-center space-x-4 mb-16">
            {modalLinkCmi && <a href={modalLinkCmi} target="_blank" rel="noopener noreferrer" className="bg-primary rounded-lg py-2 px-8 text-white hover:underline w-1/2 text-center">CMI Link</a>}
            {modalLinkCompany && <a href={modalLinkCompany} target="_blank" rel="noopener noreferrer" className="bg-primary rounded-lg py-2 px-8 text-white hover:underline w-1/2 text-center">Company Link</a>}
          </div>
        </div>
      </div>
    </div>
  );
}