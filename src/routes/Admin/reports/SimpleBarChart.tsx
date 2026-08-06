import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

interface Props {
  data: {
    name: string;
    value: number;
  }[];
  color?: string;
  height?: number;
}

export default function SimpleBarChart({ data, color = "#1E4D8C", height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EAF2FC" vertical={false} />

        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#0B1F3A" }}
          tickLine={false}
          axisLine={{ stroke: "#EAF2FC" }}
          interval={0}
          angle={data.length > 6 ? -25 : 0}
          textAnchor={data.length > 6 ? "end" : "middle"}
          height={data.length > 6 ? 48 : 24}
        />

        <YAxis
          tick={{ fontSize: 11, fill: "#0B1F3A" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />

        <Tooltip
          cursor={{ fill: "#EAF2FC" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #DCE9FB",
            fontSize: 12,
          }}
        />

        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={color} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
