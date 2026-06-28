// ─────────────────────────────────────────────────────────
// WeightChart — line chart tren berat badan (react-native-svg)
// ─────────────────────────────────────────────────────────

import { View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

export interface WeightPoint {
  date: string; // ISO
  weight: number; // kg
}

const LINE = '#0F5238';
const GRID = '#E4E2E4';
const AXIS = '#707973';

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function WeightChart({ data }: { data: WeightPoint[] }) {
  // Butuh minimal 2 titik untuk garis tren.
  if (!data || data.length < 2) return null;

  const width = Dimensions.get('window').width - 32 - 24; // screen pad + card pad
  const height = 180;
  const padL = 40;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const yMin = minW - range * 0.15;
  const yMax = maxW + range * 0.15;
  const yRange = yMax - yMin || 1;

  const xAt = (i: number) => padL + (plotW * i) / (data.length - 1);
  const yAt = (w: number) => padT + plotH * (1 - (w - yMin) / yRange);

  const polyPoints = data.map((d, i) => `${xAt(i)},${yAt(d.weight)}`).join(' ');

  // 3 garis bantu horizontal + label sumbu Y
  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  return (
    <View className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
      <Text className="mb-2 font-headline text-headline-sm font-semibold text-on-surface">
        Tren Berat Badan
      </Text>
      <Svg width={width} height={height}>
        {yTicks.map((t, idx) => {
          const yy = yAt(t);
          return (
            <Line
              key={idx}
              x1={padL}
              y1={yy}
              x2={width - padR}
              y2={yy}
              stroke={GRID}
              strokeWidth={1}
            />
          );
        })}
        {yTicks.map((t, idx) => (
          <SvgText
            key={`lbl-${idx}`}
            x={padL - 6}
            y={yAt(t) + 4}
            fontSize={10}
            fill={AXIS}
            textAnchor="end"
          >
            {t.toFixed(0)}
          </SvgText>
        ))}

        {/* Garis tren */}
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={LINE}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Titik data */}
        {data.map((d, i) => (
          <Circle key={i} cx={xAt(i)} cy={yAt(d.weight)} r={3.5} fill={LINE} />
        ))}

        {/* Label tanggal awal & akhir */}
        <SvgText x={padL} y={height - 8} fontSize={10} fill={AXIS} textAnchor="start">
          {shortDate(data[0].date)}
        </SvgText>
        <SvgText x={width - padR} y={height - 8} fontSize={10} fill={AXIS} textAnchor="end">
          {shortDate(data[data.length - 1].date)}
        </SvgText>
      </Svg>
      <Text className="mt-1 text-caption text-on-surface-variant">
        {data[0].weight} kg → {data[data.length - 1].weight} kg ·{' '}
        {data.length} penimbangan
      </Text>
    </View>
  );
}
