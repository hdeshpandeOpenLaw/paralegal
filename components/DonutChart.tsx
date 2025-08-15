'use client';

import React from 'react';

const DonutChart = ({ data, total, onLegendItemClick, activeCategory }: { data: { name: string, count: number, color: string }[], total: number, onLegendItemClick: (name: string) => void, activeCategory: string | null }) => {
  const categories = data;
  const totalTasks = total;
  const circumference = 2 * Math.PI * 14; // 2 * pi * r

  const strokeColors: { [key: string]: string } = {
    'bg-green-500': '#22c55e',
    'bg-teal-500': '#14b8a6',
    'bg-blue-500': '#3b82f6',
    'bg-pink-500': '#ec4899',
    'bg-purple-500': '#a855f7',
    'bg-amber-600': '#d97706',
    'bg-red-500': '#ef4444',
    'bg-gray-500': '#6b7280',
  };

  let offset = 0;

  return (
    <div className="flex items-stretch space-x-8">
      {/* Donut Chart */}
      <div className="relative w-32 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          {categories.map((category, index) => {
            const percentage = totalTasks > 0 ? (category.count / totalTasks) * 100 : 0;
            const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
            const strokeDashoffset = -offset;
            offset += (percentage * circumference) / 100;
            return (
              <circle
                key={index}
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke={strokeColors[category.color] || '#6b7280'}
                strokeWidth="4"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{totalTasks}</div>
            <div className="text-xs text-gray-500">Total Tasks</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-start justify-center space-x-8">
        {Array.from({ length: Math.ceil(categories.length / 5) }).map((_, colIndex) => (
          <div key={colIndex} className="flex flex-col justify-start space-y-2">
            {categories.slice(colIndex * 5, colIndex * 5 + 5).map((category) => (
              <div key={category.name} className={`flex items-center space-x-3 cursor-pointer p-1 rounded ${activeCategory === category.name ? 'bg-gray-200' : ''}`} onClick={() => onLegendItemClick(category.name)}>
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <span className="text-sm text-gray-700">{category.name}</span>
                <span className="text-sm font-medium text-gray-900">{category.count}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
