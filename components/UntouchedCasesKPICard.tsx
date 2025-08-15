'use client';

import React from 'react';
import KPICard from './KPICard';

const UntouchedCasesKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Cases That Haven't Been Touched"
      value={count.toString()}
      color="red"
    />
  );
};

export default UntouchedCasesKPICard;
