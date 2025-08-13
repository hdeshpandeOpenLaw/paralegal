'use client';

import React from 'react';

interface MatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: any; // A more specific type would be better here
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-md text-gray-900">{value}</p>
    </div>
  );
};

const MatterModal: React.FC<MatterModalProps> = ({ isOpen, onClose, matter }) => {
  if (!isOpen || !matter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{matter.display_number}</h2>
            <p className="text-lg text-gray-700">{matter.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label="Status" value={matter.status} />
            <DetailItem label="Client" value={matter.client?.name} />
            <DetailItem label="Practice Area" value={matter.practice_area?.name} />
            <DetailItem label="Responsible Attorney" value={matter.responsible_attorney?.name} />
            <DetailItem label="Billing Method" value={matter.billing_method} />
            <DetailItem label="Open Date" value={matter.open_date ? new Date(matter.open_date).toLocaleDateString() : 'N/A'} />
            <DetailItem label="Date Created" value={matter.created_at ? new Date(matter.created_at).toLocaleDateString() : 'N/A'} />
            <DetailItem label="Last Updated" value={matter.updated_at ? new Date(matter.updated_at).toLocaleDateString() : 'N/A'} />
            <DetailItem label="Maildrop Address" value={matter.maildrop_address} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatterModal;
