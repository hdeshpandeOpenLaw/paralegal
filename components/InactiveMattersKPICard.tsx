'use client';

import React from 'react';
import KPICard from './KPICard';

const InactiveMattersKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Matters with no activity in 30 Days"
      value={count.toString()}
      color="orange"
    />
  );
};

export default InactiveMattersKPICard;
