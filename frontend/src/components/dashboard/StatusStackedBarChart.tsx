import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function StatusStackedBarChart({ data }: {
  data: { name: string; approved: number; submitted: number; correction: number; draft: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#E2E6F0" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={n => n.split(" ")[1] ?? n} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="approved" stackId="s" fill="#10B981" barSize={32} />
        <Bar dataKey="submitted" stackId="s" fill="#3B82F6" barSize={32} />
        <Bar dataKey="correction" stackId="s" fill="#F59E0B" barSize={32} />
        <Bar dataKey="draft" stackId="s" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
