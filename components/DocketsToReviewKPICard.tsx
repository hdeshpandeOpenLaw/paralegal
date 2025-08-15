'use client';

import React from 'react';
import KPICard from './KPICard';

const DocketsToReviewKPICard = ({ count }: { count: number }) => {
  return (
    <KPICard
      title="Dockets to Review"
      value={count.toString()}
      color="green"
    />
  );
};

export default DocketsToReviewKPICard;
