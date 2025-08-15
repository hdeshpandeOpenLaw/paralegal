'use client';

import React from 'react';
import KPICard from './KPICard';

const OutstandingTasksKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Tasks Outstanding"
      value={count.toString()}
      color="blue"
    />
  );
};

export default OutstandingTasksKPICard;
