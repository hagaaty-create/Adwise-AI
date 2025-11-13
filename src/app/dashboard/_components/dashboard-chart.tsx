'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';

export function DashboardChart() {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // We need to wrap this in useEffect to avoid hydration errors
        // because Math.random() produces different values on server and client.
        setChartData([
          { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
          { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
        ]);
      }, []);

      if (chartData.length === 0) {
        return <div style={{ height: '350px' }} />;
      }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
            <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
            />
            <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
