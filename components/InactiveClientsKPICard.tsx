'use client';

import React from 'react';
import KPICard from './KPICard';

const InactiveClientsKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Clients with no communication in 30 Days"
      value={count.toString()}
      color="yellow"
    />
  );
};

export default InactiveClientsKPICard;
