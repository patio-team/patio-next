'use client';
import React, { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  TimeScale,
  LinearScale,
  Tooltip,
  Filler,
  Legend,
  ChartOptions,
  ChartData,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-luxon';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  TimeScale,
  LinearScale,
  Tooltip,
  Filler,
  Legend,
  annotationPlugin,
);

export interface VotePoint {
  votingId: string;
  createdAt: string; // ISO timestamp
  average: number;
  movingAverage: number;
}

interface VoteChartProps {
  data: VotePoint[];
  selectedVotingId?: string;
  onPointClick?: (votingId: string) => void;
}

const colorForAvg = (avg: number): string => {
  if (avg > 0 && avg <= 1) return '#fe346e';
  if (avg > 1 && avg <= 2) return '#ff7473';
  if (avg > 2 && avg <= 3) return '#ffc952';
  if (avg > 3 && avg <= 4) return '#98ddab';
  if (avg > 4 && avg <= 5) return '#3fe3d2';
  return '#888888';
};

export default function VoteChart({
  data,
  selectedVotingId,
  onPointClick,
}: VoteChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Build the datasets, including per-point styling for the "selected" mark.
  const chartData = useMemo<ChartData<'line'>>(() => {
    const labels = data.map((pt) => pt.createdAt);
    const avgData = data.map((pt) => pt.average);
    const movAvgData = data.map((pt) => pt.movingAverage);

    // Determine per-point radius & backgroundColor for "selected" highlight
    const pointRadii = data.map((pt) =>
      pt.votingId === selectedVotingId ? 9 : 4,
    );
    const pointColors = data.map((pt) =>
      pt.votingId === selectedVotingId ? colorForAvg(pt.average) : '#34314C',
    );

    return {
      labels,
      datasets: [
        {
          label: 'Average',
          data: avgData,
          fill: false,
          tension: 0.3,
          borderWidth: 4,
          borderColor: '#34314C',
          pointRadius: pointRadii,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: pointRadii.map((r) => (r > 4 ? 7 : 0)),
          pointHoverRadius: 10,
        },
        {
          label: 'Moving Average',
          data: movAvgData,
          fill: false,
          tension: 0.3,
          borderDash: [8, 4],
          borderWidth: 4,
          borderColor: '#98ddab',
          pointRadius: 0,
        },
      ],
    };
  }, [data, selectedVotingId]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: { tooltipFormat: 'LLL dd, yyyy' },
        title: { display: true, text: 'Date' },
      },
      y: {
        min: 1,
        max: 5,
        title: { display: true, text: 'Rating' },
      },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'nearest', intersect: false },
      annotation: {
        annotations: selectedVotingId
          ? [
              {
                type: 'line',
                scaleID: 'x',
                value:
                  data.find((pt) => pt.votingId === selectedVotingId)
                    ?.createdAt || '',
                borderColor: '#34314C',
                borderWidth: 2,
                // label: { enabled: false },
              },
            ]
          : [],
      },
    },
    onClick: (evt: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length && onPointClick) {
        const idx = elements[0].index!;
        const id = data[idx].votingId;
        onPointClick(id);
      }
    },
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
      />
    </div>
  );
}
