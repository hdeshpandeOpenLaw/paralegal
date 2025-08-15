'use client';

import React from 'react';
import KPICard from './KPICard';

const ReplenishmentNeededKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Cases Needing Replenishment"
      value={count.toString()}
      color="cyan"
    />
  );
};

export default ReplenishmentNeededKPICard;
