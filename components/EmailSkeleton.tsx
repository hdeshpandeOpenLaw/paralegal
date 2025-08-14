const EmailSkeleton = () => (
  <div className="rounded-lg p-4 shadow-sm mb-4 bg-white">
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3 flex-1">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
        </div>
      </div>
      <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
    </div>
  </div>
);

export default EmailSkeleton;
