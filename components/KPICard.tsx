'use client';

import React from 'react';

const KPICard = ({ title, value, color = "blue" }: { title: string, value: string, color?: string }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
  </div>
);

export default KPICard;
