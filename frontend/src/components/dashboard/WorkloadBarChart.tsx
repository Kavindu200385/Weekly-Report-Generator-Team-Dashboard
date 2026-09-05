import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function WorkloadBarChart({ data }: { data: { label: string; v: number; color?: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#E2E6F0" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="v" radius={[4, 4, 0, 0]} barSize={36}>
          {data.map((d, i) => <Cell key={i} fill={d.color ?? "#7C3AED"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
