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
  matterFilter: string;
  setMatterFilter: (filter: string) => void;
  sortOption: string;
  setSortOption: (sort: string) => void;
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
  matterFilter,
  setMatterFilter,
  sortOption,
  setSortOption,
}) => {
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showSortDateSubMenu, setShowSortDateSubMenu] = React.useState(false);
  const [showSortClientSubMenu, setShowSortClientSubMenu] = React.useState(false);
  const [openSortDateUp, setOpenSortDateUp] = React.useState(false);
  const [openSortClientUp, setOpenSortClientUp] = React.useState(false);
  const filterMenuRef = React.useRef<HTMLDivElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);
  const sortDateSubMenuRef = React.useRef<HTMLDivElement>(null);
  const sortClientSubMenuRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (showSortDateSubMenu && sortDateSubMenuRef.current) {
      const rect = sortDateSubMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setOpenSortDateUp(true);
      } else {
        setOpenSortDateUp(false);
      }
    }
    if (showSortClientSubMenu && sortClientSubMenuRef.current) {
      const rect = sortClientSubMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setOpenSortClientUp(true);
      } else {
        setOpenSortClientUp(false);
      }
    }
  }, [showSortDateSubMenu, showSortClientSubMenu]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
        setShowSortDateSubMenu(false);
        setShowSortClientSubMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterMenuRef, sortMenuRef]);

  const handleSortSubMenu = (submenu: 'date' | 'client') => {
    setShowSortDateSubMenu(submenu === 'date' ? !showSortDateSubMenu : false);
    setShowSortClientSubMenu(submenu === 'client' ? !showSortClientSubMenu : false);
  };

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

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Matters</h3>
        <div className="flex items-center">
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19l-4 2v-5.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <a href="#" onClick={(e) => { e.preventDefault(); setMatterFilter('Open'); setShowFilterMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${matterFilter === 'Open' ? 'bg-gray-100 font-semibold' : ''}`}>Open</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setMatterFilter('Pending'); setShowFilterMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${matterFilter === 'Pending' ? 'bg-gray-100 font-semibold' : ''}`}>Pending</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setMatterFilter('Closed'); setShowFilterMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${matterFilter === 'Closed' ? 'bg-gray-100 font-semibold' : ''}`}>Closed</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setMatterFilter('All'); setShowFilterMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${matterFilter === 'All' ? 'bg-gray-100 font-semibold' : ''}`}>All</a>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h12M3 12h8" />
              </svg>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <a href="#" onClick={(e) => { e.preventDefault(); setSortOption('id(asc)'); setShowSortMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${sortOption === 'id(asc)' ? 'bg-gray-100 font-semibold' : ''}`}>Default</a>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="py-1 relative">
                  <button onClick={() => handleSortSubMenu('date')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                    <span>Open Date</span>
                    <svg className={`w-4 h-4 transition-transform ${showSortDateSubMenu ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                  {showSortDateSubMenu && (
                    <div
                      ref={sortDateSubMenuRef}
                      className={`absolute left-full w-48 bg-white rounded-md shadow-lg z-20 ${openSortDateUp ? 'bottom-0' : 'top-0'}`}
                    >
                      <div className="py-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); setSortOption('open_date(asc)'); setShowSortMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${sortOption === 'open_date(asc)' ? 'bg-gray-100 font-semibold' : ''}`}>Old First</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setSortOption('open_date(desc)'); setShowSortMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${sortOption === 'open_date(desc)' ? 'bg-gray-100 font-semibold' : ''}`}>New First</a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="py-1 relative">
                  <button onClick={() => handleSortSubMenu('client')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                    <span>Client Name</span>
                    <svg className={`w-4 h-4 transition-transform ${showSortClientSubMenu ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                  {showSortClientSubMenu && (
                    <div
                      ref={sortClientSubMenuRef}
                      className={`absolute left-full w-48 bg-white rounded-md shadow-lg z-20 ${openSortClientUp ? 'bottom-0' : 'top-0'}`}
                    >
                      <div className="py-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); setSortOption('client.name(asc)'); setShowSortMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${sortOption === 'client.name(asc)' ? 'bg-gray-100 font-semibold' : ''}`}>A-Z</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setSortOption('client.name(desc)'); setShowSortMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${sortOption === 'client.name(desc)' ? 'bg-gray-100 font-semibold' : ''}`}>Z-A</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {clioMatters.length > 0 ? (
        <>
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
        </>
      ) : (
        <p className="mt-4 text-gray-500">No matters found.</p>
      )}
    </div>
  );
};

export default MatterTabContent;
