'use client';

import React from 'react';
import KPICard from './KPICard';

const NegativeBalanceCasesKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Cases with Negative Balances"
      value={count.toString()}
      color="teal"
    />
  );
};

export default NegativeBalanceCasesKPICard;
