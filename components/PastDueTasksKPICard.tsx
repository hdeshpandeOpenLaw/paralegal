'use client';

import React from 'react';
import KPICard from './KPICard';

const PastDueTasksKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Tasks Past Due Date"
      value={count.toString()}
      color="purple"
    />
  );
};

export default PastDueTasksKPICard;
