interface GanttProcess {
  id: string;
  startTime: number;
  endTime: number;
}

interface GanttChartProps {
  processes: GanttProcess[];
  title: string;
}

export default function GanttChart({ processes, title }: GanttChartProps) {
  // Find the maximum end time to scale the chart
  const maxTime = Math.max(...processes.map(p => p.endTime), 1);
  const scale = 100 / maxTime;

  // Generate time markers
  const timeMarkers = [];
  for (let i = 0; i <= maxTime; i += Math.ceil(maxTime / 10)) {
    timeMarkers.push(i);
  }

  // Color palette for processes
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
    'bg-lime-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500'
  ];

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title} - Gantt Chart</h3>
      
      {/* Process Labels */}
      <div className="flex flex-wrap gap-2 mb-4">
        {processes.map((process, index) => (
          <div key={process.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
            <span className="text-sm text-gray-700">{process.id}</span>
          </div>
        ))}
      </div>

      {/* Gantt Chart Container */}
      <div className="relative bg-gray-100 rounded-lg p-4 border border-gray-300">
        {/* Time Scale */}
        <div className="flex justify-between mb-2 px-2">
          {timeMarkers.map(time => (
            <div key={time} className="text-xs text-gray-600">
              {time}
            </div>
          ))}
        </div>

        {/* Gantt Bars */}
        <div className="relative h-16 bg-white rounded border border-gray-300 overflow-hidden">
          {processes.map((process, index) => {
            const left = (process.startTime / maxTime) * 100;
            const width = ((process.endTime - process.startTime) / maxTime) * 100;
            
            return (
              <div
                key={`${process.id}-${index}`}
                className={`absolute h-full ${colors[index % colors.length]} rounded transition-all duration-300 hover:opacity-80`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
                title={`${process.id}: ${process.startTime} - ${process.endTime}`}
              >
                <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                  {process.id}
                </div>
              </div>
            );
          })}

          {/* Grid Lines */}
          <div className="absolute inset-0 flex">
            {timeMarkers.map(time => (
              <div
                key={`line-${time}`}
                className="border-l border-gray-300 h-full"
                style={{ left: `${(time / maxTime) * 100}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Time Labels */}
        <div className="flex justify-between mt-2 px-2">
          {timeMarkers.map(time => (
            <div key={`label-${time}`} className="text-xs text-gray-600">
              {time}
            </div>
          ))}
        </div>
      </div>

      {/* Process Details Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Process</th>
              <th className="px-4 py-2 text-center">Start Time</th>
              <th className="px-4 py-2 text-center">End Time</th>
              <th className="px-4 py-2 text-center">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processes.map((process, index) => (
              <tr key={process.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`}></div>
                    {process.id}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{process.startTime}</td>
                <td className="px-4 py-2 text-center">{process.endTime}</td>
                <td className="px-4 py-2 text-center">{process.endTime - process.startTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}