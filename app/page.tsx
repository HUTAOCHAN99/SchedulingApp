'use client';

import { useState } from 'react';
import SchedulingTable from '../components/SchedulingTable';

interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  originalBurstTime: number;
  startTime?: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  remainingTime?: number;
}

interface ProcessInput {
  id: string;
  arrivalTime: string;
  burstTime: string;
}

interface Results {
  fifo: Process[];
  sjfNonPreemptive: Process[];
  sjfPreemptive: Process[];
  roundRobin: Process[];
}

export default function Home() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processInput, setProcessInput] = useState<ProcessInput>({ 
    id: '', 
    arrivalTime: '', 
    burstTime: '' 
  });
  const [results, setResults] = useState<Results | null>(null);
  const [quantum, setQuantum] = useState<number>(4);

  const addProcess = () => {
    if (processInput.id && processInput.arrivalTime !== '' && processInput.burstTime !== '') {
      const newProcess: Process = {
        id: processInput.id,
        arrivalTime: parseInt(processInput.arrivalTime),
        burstTime: parseInt(processInput.burstTime),
        originalBurstTime: parseInt(processInput.burstTime)
      };
      setProcesses([...processes, newProcess]);
      setProcessInput({ id: '', arrivalTime: '', burstTime: '' });
    }
  };

  const removeProcess = (index: number) => {
    const newProcesses = processes.filter((_, i) => i !== index);
    setProcesses(newProcesses);
  };

  const clearAll = () => {
    setProcesses([]);
    setResults(null);
  };

  const generateSampleData = () => {
    const sampleProcesses: Process[] = [];
    for (let i = 1; i <= 10; i++) {
      sampleProcesses.push({
        id: `P${i}`,
        arrivalTime: Math.floor(Math.random() * 10),
        burstTime: Math.floor(Math.random() * 20) + 1,
        originalBurstTime: Math.floor(Math.random() * 20) + 1
      });
    }
    setProcesses(sampleProcesses);
  };

  // FIFO Algorithm
  const calculateFIFO = (procs: Process[]): Process[] => {
    const sortedProcs = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const results: Process[] = [];

    sortedProcs.forEach(proc => {
      const startTime = Math.max(currentTime, proc.arrivalTime);
      const completionTime = startTime + proc.burstTime;
      const turnaroundTime = completionTime - proc.arrivalTime;
      const waitingTime = startTime - proc.arrivalTime;

      results.push({
        ...proc,
        startTime,
        completionTime,
        turnaroundTime,
        waitingTime
      });

      currentTime = completionTime;
    });

    return results;
  };

  // SJF Non-Preemptive
  const calculateSJFNonPreemptive = (procs: Process[]): Process[] => {
    const processes = [...procs].map(p => ({ ...p }));
    let currentTime = 0;
    const results: Process[] = [];
    const completed = new Set<string>();

    while (results.length < processes.length) {
      const available = processes
        .filter(p => p.arrivalTime <= currentTime && !completed.has(p.id))
        .sort((a, b) => a.burstTime - b.burstTime);

      if (available.length === 0) {
        currentTime++;
        continue;
      }

      const nextProcess = available[0];
      const startTime = Math.max(currentTime, nextProcess.arrivalTime);
      const completionTime = startTime + nextProcess.burstTime;
      const turnaroundTime = completionTime - nextProcess.arrivalTime;
      const waitingTime = startTime - nextProcess.arrivalTime;

      results.push({
        ...nextProcess,
        startTime,
        completionTime,
        turnaroundTime,
        waitingTime
      });

      completed.add(nextProcess.id);
      currentTime = completionTime;
    }

    return results;
  };

  // SJF Preemptive
  const calculateSJFPreemptive = (procs: Process[]): Process[] => {
    const processes = [...procs].map(p => ({ 
      ...p, 
      remainingTime: p.burstTime,
      startTime: -1,
      completionTime: -1
    }));
    
    let currentTime = 0;
    const results: Process[] = [];
    const completed = new Set<string>();

    while (results.length < processes.length) {
      const available = processes
        .filter(p => p.arrivalTime <= currentTime && (p.remainingTime ?? 0) > 0)
        .sort((a, b) => (a.remainingTime ?? 0) - (b.remainingTime ?? 0));

      if (available.length === 0) {
        currentTime++;
        continue;
      }

      const currentProcess = available[0];
      
      if (currentProcess.startTime === -1) {
        currentProcess.startTime = currentTime;
      }

      currentProcess.remainingTime = (currentProcess.remainingTime ?? 0) - 1;
      currentTime++;

      if (currentProcess.remainingTime === 0) {
        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        results.push({ ...currentProcess });
        completed.add(currentProcess.id);
      }
    }

    return results.sort((a, b) => (a.completionTime ?? 0) - (b.completionTime ?? 0));
  };

  // Round Robin
  const calculateRoundRobin = (procs: Process[], quantum: number): Process[] => {
    const processes = [...procs].map(p => ({ 
      ...p, 
      remainingTime: p.burstTime,
      startTime: -1
    }));
    
    let currentTime = 0;
    const queue: Process[] = [];
    const results: Process[] = [];
    const completed = new Set<string>();
    let index = 0;

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (results.length < processes.length) {
      while (index < processes.length && processes[index].arrivalTime <= currentTime) {
        queue.push(processes[index]);
        index++;
      }

      if (queue.length === 0) {
        currentTime++;
        continue;
      }

      const currentProcess = queue.shift()!;

      if (currentProcess.startTime === -1) {
        currentProcess.startTime = currentTime;
      }

      const executionTime = Math.min(quantum, currentProcess.remainingTime ?? 0);
      currentTime += executionTime;
      currentProcess.remainingTime = (currentProcess.remainingTime ?? 0) - executionTime;

      while (index < processes.length && processes[index].arrivalTime <= currentTime) {
        queue.push(processes[index]);
        index++;
      }

      if ((currentProcess.remainingTime ?? 0) > 0) {
        queue.push(currentProcess);
      } else {
        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        results.push({ ...currentProcess });
        completed.add(currentProcess.id);
      }
    }

    return results;
  };

  const calculateAllAlgorithms = () => {
    if (processes.length === 0) return;

    const fifoResults = calculateFIFO(processes);
    const sjfNonPreemptiveResults = calculateSJFNonPreemptive(processes);
    const sjfPreemptiveResults = calculateSJFPreemptive(processes);
    const roundRobinResults = calculateRoundRobin(processes, quantum);

    setResults({
      fifo: fifoResults,
      sjfNonPreemptive: sjfNonPreemptiveResults,
      sjfPreemptive: sjfPreemptiveResults,
      roundRobin: roundRobinResults
    });
  };

  const calculateAverages = (results: Process[]) => {
    const avgWaitingTime = results.reduce((sum, proc) => sum + (proc.waitingTime ?? 0), 0) / results.length;
    const avgTurnaroundTime = results.reduce((sum, proc) => sum + (proc.turnaroundTime ?? 0), 0) / results.length;
    return { avgWaitingTime, avgTurnaroundTime };
  };

  const hasResults = results !== null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CPU Scheduling Simulator - Dual Core Processor
          </h1>
          <p className="text-lg text-gray-600">
            Simulasi algoritma penjadwalan proses: FIFO, SJF Non-Preemptive, SJF Preemptive, dan Round Robin
          </p>
        </div>

        {/* Input Section */}
        <div className="card p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Input Proses</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="ID Proses (P1, P2, ...)"
              value={processInput.id}
              onChange={(e) => setProcessInput({...processInput, id: e.target.value})}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Arrival Time"
              value={processInput.arrivalTime}
              onChange={(e) => setProcessInput({...processInput, arrivalTime: e.target.value})}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Burst Time"
              value={processInput.burstTime}
              onChange={(e) => setProcessInput({...processInput, burstTime: e.target.value})}
              className="input-field"
            />
            <button className="btn btn-primary" onClick={addProcess}>
              Tambah Proses
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button className="btn btn-success" onClick={generateSampleData}>
              Generate 10 Proses Sample
            </button>
            <button className="btn btn-primary" onClick={calculateAllAlgorithms}>
              Hitung Semua Algoritma
            </button>
            <button className="btn btn-danger" onClick={clearAll}>
              Hapus Semua
            </button>
          </div>

          {/* Process List */}
          <div className="mt-4">
            <h4 className="text-lg font-medium text-gray-700 mb-3">
              Daftar Proses ({processes.length})
            </h4>
            <div className="space-y-2">
              {processes.map((proc, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-700">
                    {proc.id} - AT: {proc.arrivalTime}, BT: {proc.burstTime}
                  </span>
                  <button 
                    className="btn btn-danger text-sm py-1 px-3"
                    onClick={() => removeProcess(index)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Input */}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-gray-700 font-medium">Quantum Time untuk Round Robin:</label>
            <input
              type="number"
              value={quantum}
              onChange={(e) => setQuantum(parseInt(e.target.value) || 4)}
              className="input-field w-20"
            />
          </div>
        </div>

        {/* Results */}
        {hasResults && (
          <>
            {/* Average Results */}
            <div className="card p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Hasil Perhitungan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(results).map(([algo, result]) => {
                  const averages = calculateAverages(result);
                  return (
                    <div key={algo} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                        {algo.replace(/([A-Z])/g, ' $1')}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {averages.avgWaitingTime.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Avg Waiting Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {averages.avgTurnaroundTime.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Avg Turnaround Time</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Tables */}
            <SchedulingTable results={results} />

            {/* Comparison Section */}
            <div className="card p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Perbandingan Algoritma</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(results).map(([algo, result]) => {
                  const averages = calculateAverages(result);
                  return (
                    <div key={algo} className="bg-linear-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg text-center">
                      <h4 className="text-lg font-bold mb-4 capitalize">
                        {algo.replace(/([A-Z])/g, ' $1')}
                      </h4>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">WT: {averages.avgWaitingTime.toFixed(2)}</div>
                        <div className="text-2xl font-bold">TAT: {averages.avgTurnaroundTime.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analysis Section */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Analisis Hasil</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong className="text-blue-600">FIFO:</strong> Algoritma sederhana yang menjalankan proses sesuai urutan kedatangan. 
                  Cocok untuk sistem batch sederhana tetapi dapat menyebabkan convoy effect.
                </p>
                <p>
                  <strong className="text-green-600">SJF Non-Preemptive:</strong> Memilih proses dengan burst time terpendek. 
                  Memberikan waiting time terbaik tetapi membutuhkan pengetahuan burst time sebelumnya.
                </p>
                <p>
                  <strong className="text-purple-600">SJF Preemptive:</strong> Versi preemptive dari SJF yang dapat menginterupsi proses 
                  yang sedang berjalan jika ada proses baru dengan burst time lebih pendek.
                </p>
                <p>
                  <strong className="text-orange-600">Round Robin:</strong> Menggunakan time quantum untuk memberikan waktu CPU yang adil 
                  ke semua proses. Baik untuk sistem time-sharing.
                </p>
                <p className="pt-3 border-t border-gray-200">
                  <strong className="text-gray-900">Kesimpulan:</strong> Dalam simulasi ini, algoritma dengan average waiting time dan 
                  turnaround time terendah biasanya adalah SJF Preemptive, namun performa tergantung pada 
                  karakteristik proses input.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}