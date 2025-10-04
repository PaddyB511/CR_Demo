import React from 'react';
import lvl1badge from '../../assets/lvl1badge.svg';

const VB_W = 51;
const VB_H = 56;

export const LevelBadge = ({ value, size = 56 }: { value: number | string; size?: number }) => {
  const width = (size * VB_W) / VB_H;
  const fontSize = VB_H * 0.40; // in viewBox units; scales with the SVG

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Level ${value}`}
    >
      {/* Fill the entire viewBox with the badge graphic */}
      <image href={lvl1badge} x="0" y="0" width={VB_W} height={VB_H} />

      {/* Centered number */}
      <text
        x="50%"
        y="34%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontWeight="700"
        fontSize={fontSize}
      >
        {value}
      </text>
    </svg>
  );
};

export default LevelBadge;