'use client';

import React from 'react';

const CalendarEvent = ({ time, title, type, icon }: { 
  time: string, 
  title: string, 
  type: string, 
  icon: React.ReactNode 
}) => (
  <div className="flex items-center space-x-2 mb-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    <span className="text-xs text-gray-600">{time}</span>
    <span className="text-xs text-gray-800">{title}</span>
    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{type}</span>
    {icon}
  </div>
);

export default CalendarEvent;
