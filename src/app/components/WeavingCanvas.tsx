'use client';

import React, { useEffect, useRef } from 'react';

type Entry = {
  picks: number;
  box: number;
};

type Props = {
  data: Entry[];
  height?: number;
};

const boxColors: Record<number, string> = {
  1: '#0000FF', // Blue
  2: '#00FF00', // Green
  3: '#FF0000', // Red
};

export const WeavingCanvas: React.FC<Props> = ({ data, height = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate total width
    const totalWidth = data.reduce((sum, entry) => sum + Math.abs(entry.picks), 0);
    canvas.width = totalWidth;
    canvas.height = height;

    let x = 0;
    for (const entry of data) {
      const width = Math.abs(entry.picks);
      const color = boxColors[entry.box] || '#000000';

      ctx.fillStyle = color;
      ctx.fillRect(x, 0, width, height);
      x += width;
    }
  }, [data, height]);

  return <canvas ref={canvasRef} className="border rounded shadow" />;
};
