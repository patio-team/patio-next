'use client';
import React, { useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  day: string; // ISO timestamp
  average: number;
  movingAverage: number;
}

interface VoteChartProps {
  data: VotePoint[];
  teamId: string;
  selectedVotingId?: string;
  onPointClick?: (votingId: string) => void;
}

const colorForAvg = (avg: number): string => {
  if (avg >= 4.5) return '#3fe3d2'; // 5
  if (avg >= 3.5) return '#98ddab'; // 4
  if (avg >= 2.5) return '#ffc952'; // 3
  if (avg >= 1.5) return '#ff7473'; // 2
  if (avg >= 0.5) return '#fe346e'; // 1
  return '#888888';
};

export default function VoteChart({
  data,
  teamId,
  selectedVotingId,
  onPointClick,
}: VoteChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const router = useRouter();

  // Build the datasets, including per-point styling for the "selected" mark.
  const chartData = useMemo<ChartData<'line'>>(() => {
    const labels = data.map((pt) => pt.day);
    const avgData = data.map((pt) => pt.average);
    const movAvgData = data.map((pt) => pt.movingAverage);

    // Determine per-point radius & backgroundColor for "selected" highlight
    const pointRadii = data.map((pt) =>
      pt.votingId === selectedVotingId ? 9 : 4,
    );
    const pointColors = data.map((pt) =>
      pt.votingId === selectedVotingId
        ? colorForAvg(pt.average)
        : colorForAvg(pt.average),
    );

    // Create segment colors for the line based on average values
    const segmentColors = data.map((pt) => colorForAvg(pt.average));

    return {
      labels,
      datasets: [
        {
          label: 'Average',
          data: avgData,
          fill: false,
          tension: 0.3,
          borderWidth: 4,
          segment: {
            borderColor: (ctx) => {
              const index = ctx.p0DataIndex;
              return segmentColors[index] || '#34314C';
            },
          },
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
        time: {
          tooltipFormat: 'LLL dd, yyyy',
          displayFormats: {
            day: 'LLL dd',
          },
        },
        title: { display: true, text: 'Date' },
        ticks: {
          source: 'data',
          autoSkip: false,
        },
      },
      y: {
        min: 1,
        max: 5,
        title: { display: true, text: 'Rating' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'nearest', intersect: false },
      annotation: {
        annotations: selectedVotingId
          ? [
              {
                type: 'line',
                scaleID: 'x',
                value:
                  data.find((pt) => pt.votingId === selectedVotingId)?.day ||
                  '',
                borderColor: '#34314C',
                borderWidth: 2,
              },
            ]
          : [],
      },
    },
    onClick: (evt: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length) {
        const idx = elements[0].index!;
        const point = data[idx];

        // Format date as YYYY-MM-DD
        const date = new Date(point.day);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Navigate to team day page
        router.push(`/team/${teamId}/${formattedDate}`);

        // Also call the original onPointClick if provided
        if (onPointClick) {
          onPointClick(point.votingId);
        }
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
