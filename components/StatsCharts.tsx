"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type StatsChartPoint = {
  label: string;
  hitRate: number;
  totalArrows: number;
  averageHitsPerEnd: number;
};

type StatsChartsProps = {
  data: StatsChartPoint[];
};

export function StatsCharts({ data }: StatsChartsProps) {
  if (!data.length) {
    return (
      <div className="empty-state">
        <h3>No chart data yet</h3>
        <p className="hint-text">Save practice sessions to see your progress over time.</p>
      </div>
    );
  }

  return (
    <section className="two-column-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Line chart</p>
            <h2>Hit rate over time</h2>
          </div>
        </div>
        <div className="recharts-frame">
          <ResponsiveContainer height={260} width="100%">
            <LineChart data={data} margin={{ left: -18, right: 8, top: 18 }}>
              <CartesianGrid stroke="#ded8cd" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: "#6f6d67", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#6f6d67", fontSize: 12 }} />
              <Tooltip />
              <Line dataKey="hitRate" name="Hit rate %" stroke="#2f6d80" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bar chart</p>
            <h2>Arrows recorded</h2>
          </div>
        </div>
        <div className="recharts-frame">
          <ResponsiveContainer height={260} width="100%">
            <BarChart data={data} margin={{ left: -18, right: 8, top: 18 }}>
              <CartesianGrid stroke="#ded8cd" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: "#6f6d67", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6f6d67", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="totalArrows" fill="#a9473d" name="Total arrows" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Line chart</p>
            <h2>Average hits per end</h2>
          </div>
        </div>
        <div className="recharts-frame">
          <ResponsiveContainer height={260} width="100%">
            <LineChart data={data} margin={{ left: -18, right: 8, top: 18 }}>
              <CartesianGrid stroke="#ded8cd" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: "#6f6d67", fontSize: 12 }} />
              <YAxis domain={[0, 4]} tick={{ fill: "#6f6d67", fontSize: 12 }} />
              <Tooltip />
              <Line dataKey="averageHitsPerEnd" name="Avg hits/end" stroke="#277a48" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  );
}
