'use client';

import React from 'react';
import MatterSkeleton from './MatterSkeleton';

interface MatterTabContentProps {
  isClioConnected: boolean;
  handleConnectClio: () => void;
  loadingClio: boolean;
  clioError: string | null;
  clioMatters: any[];
  handleMatterClick: (matterId: string) => void;
  totalMattersCount: number;
  mattersCurrentPage: number;
  mattersPerPage: number;
  setMattersCurrentPage: (page: number) => void;
}

const MatterTabContent: React.FC<MatterTabContentProps> = ({
  isClioConnected,
  handleConnectClio,
  loadingClio,
  clioError,
  clioMatters,
  handleMatterClick,
  totalMattersCount,
  mattersCurrentPage,
  mattersPerPage,
  setMattersCurrentPage,
}) => {
  if (!isClioConnected) {
    return (
      <button onClick={handleConnectClio} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
        Connect to Clio
      </button>
    );
  }

  if (loadingClio) {
    return (
      <div className="mt-8">
        <ul>
          <MatterSkeleton />
          <MatterSkeleton />
          <MatterSkeleton />
          <MatterSkeleton />
          <MatterSkeleton />
        </ul>
      </div>
    );
  }

  if (clioError) {
    return <p className="mt-4 text-red-500">{clioError}</p>;
  }

  if (clioMatters.length > 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Matters</h3>
        <ul>
          {clioMatters.map((matter) => (
            <li
              key={matter.id}
              className="mt-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100"
              onClick={() => handleMatterClick(matter.id)}
            >
              {matter.display_number} - {matter.description}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Showing {totalMattersCount > 0 ? (mattersCurrentPage - 1) * mattersPerPage + 1 : 0}-
            {Math.min(mattersCurrentPage * mattersPerPage, totalMattersCount)} of {totalMattersCount} results
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMattersCurrentPage(mattersCurrentPage - 1)}
              disabled={mattersCurrentPage === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setMattersCurrentPage(mattersCurrentPage + 1)}
              disabled={mattersCurrentPage * mattersPerPage >= totalMattersCount}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MatterTabContent;
