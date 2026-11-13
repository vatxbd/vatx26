import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardPieChart({ totalVat, totalTax, t }: { totalVat: number; totalTax: number; t: any }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={[
            { name: t.vat, value: totalVat || 1 },
            { name: t.tax, value: totalTax || 1 },
          ]}
          cx="50%"
          cy="50%"
          innerRadius={100}
          outerRadius={130}
          paddingAngle={12}
          dataKey="value"
          stroke="none"
        >
          <Cell fill="#10b981" />
          <Cell fill="#18181b" />
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
        />
      </RePieChart>
    </ResponsiveContainer>
  );
}
