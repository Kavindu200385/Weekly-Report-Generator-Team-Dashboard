import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function TrendLineChart({ data }: { data: { w: string; v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#E2E6F0" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="w" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} domain={["dataMin - 2", "dataMax + 2"]} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: "#7C3AED" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
