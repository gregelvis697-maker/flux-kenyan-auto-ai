import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VerificationChartProps {
  data: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function VerificationChart({ data }: VerificationChartProps) {
  const chartData = [
    { name: 'Pending', value: data.pending, color: 'hsl(45, 100%, 50%)' },
    { name: 'Approved', value: data.approved, color: 'hsl(142, 76%, 36%)' },
    { name: 'Rejected', value: data.rejected, color: 'hsl(0, 84%, 60%)' },
  ];

  const total = data.pending + data.approved + data.rejected;

  if (total === 0) {
    return (
      <Card className="border-border/50 bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Verification Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Verification Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 60%, 12%)',
                border: '1px solid hsl(220, 40%, 18%)',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}