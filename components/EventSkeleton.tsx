const EventSkeleton = () => (
  <div className="flex items-center space-x-2 mb-2 p-2">
    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
  </div>
);

export default EventSkeleton;
