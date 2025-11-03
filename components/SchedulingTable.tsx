interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  originalBurstTime: number;
  startTime?: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
}

interface Results {
  fifo: Process[];
  sjfNonPreemptive: Process[];
  sjfPreemptive: Process[];
  roundRobin: Process[];
}

interface SchedulingTableProps {
  results: Results;
}

export default function SchedulingTable({ results }: SchedulingTableProps) {
  const formatAlgorithmName = (algo: string) => {
    const names: { [key: string]: string } = {
      fifo: 'FIFO',
      sjfNonPreemptive: 'SJF Non-Preemptive',
      sjfPreemptive: 'SJF Preemptive',
      roundRobin: 'Round Robin'
    };
    return names[algo] || algo;
  };

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Detail Hasil Perhitungan</h3>
      <div className="space-y-8">
        {Object.entries(results).map(([algorithm, processes]) => (
          <div key={algorithm}>
            <h4 className="text-lg font-bold text-gray-700 mb-4">
              {formatAlgorithmName(algorithm)}
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Process ID</th>
                    <th className="px-4 py-3 text-center">Arrival Time</th>
                    <th className="px-4 py-3 text-center">Burst Time</th>
                    <th className="px-4 py-3 text-center">Start Time</th>
                    <th className="px-4 py-3 text-center">Completion Time</th>
                    <th className="px-4 py-3 text-center">Waiting Time</th>
                    <th className="px-4 py-3 text-center">Turnaround Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processes.map((proc: Process, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{proc.id}</td>
                      <td className="px-4 py-3 text-center">{proc.arrivalTime}</td>
                      <td className="px-4 py-3 text-center">{proc.originalBurstTime || proc.burstTime}</td>
                      <td className="px-4 py-3 text-center">{proc.startTime}</td>
                      <td className="px-4 py-3 text-center">{proc.completionTime}</td>
                      <td className="px-4 py-3 text-center">{proc.waitingTime}</td>
                      <td className="px-4 py-3 text-center">{proc.turnaroundTime}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-semibold">
                    <td colSpan={5} className="px-4 py-3 text-gray-700">Rata-rata</td>
                    <td className="px-4 py-3 text-center text-blue-600">
                      {(
                        processes.reduce((sum: number, proc: Process) => sum + (proc.waitingTime ?? 0), 0) / processes.length
                      ).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-green-600">
                      {(
                        processes.reduce((sum: number, proc: Process) => sum + (proc.turnaroundTime ?? 0), 0) / processes.length
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}