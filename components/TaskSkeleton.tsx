const TaskSkeleton = () => (
  <tr className="border-b border-gray-100">
    <td className="py-3 px-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse"></div>
    </td>
  </tr>
);

export default TaskSkeleton;
