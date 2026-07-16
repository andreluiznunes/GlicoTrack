"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";

type Point = { measured_at: string; value_mg_dl: number };
type Target = { min_mg_dl: number; max_mg_dl: number } | null;

const TEAL = "#0d9488";
const RED = "#ef4444";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
});

function GlucoseDot(
  target: Target,
): (props: { cx?: number; cy?: number; payload?: { value: number } }) => React.ReactElement {
  return function renderDot({ cx, cy, payload }) {
    if (cx == null || cy == null || !payload) {
      return <circle cx={0} cy={0} r={0} fill="none" />;
    }

    const outOfRange = target
      ? payload.value < target.min_mg_dl || payload.value > target.max_mg_dl
      : false;

    return <circle cx={cx} cy={cy} r={4} fill={outOfRange ? RED : TEAL} stroke="none" />;
  };
}

export function GlucoseChart({
  measurements,
  target,
}: {
  measurements: Point[];
  target: Target;
}) {
  const data = measurements
    .map((m) => ({ timestamp: new Date(m.measured_at).getTime(), value: m.value_mg_dl }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#94a3b8" strokeOpacity={0.25} strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(ts) => dateFormatter.format(new Date(ts))}
          tick={{ fontSize: 12, fill: "#64748b" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          width={40}
          domain={["dataMin - 20", "dataMax + 20"]}
        />
        <Tooltip
          formatter={(value) => [`${value} mg/dL`, "Glicemia"]}
          labelFormatter={(label) => dateTimeFormatter.format(new Date(Number(label)))}
        />
        {target && (
          <ReferenceArea
            y1={target.min_mg_dl}
            y2={target.max_mg_dl}
            fill={TEAL}
            fillOpacity={0.1}
            strokeOpacity={0}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={TEAL}
          strokeWidth={2}
          dot={GlucoseDot(target)}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
