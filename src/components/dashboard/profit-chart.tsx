"use client"

import { Area, AreaChart, Bar, BarChart, ComposedChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

type ProfitChartProps = {
  data: { month: string; revenue: number; cost: number; profit: number }[];
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-2))",
  },
  cost: {
    label: "Custo",
    color: "hsl(var(--chart-4))",
  },
  profit: {
    label: "Lucro",
    color: "hsl(var(--chart-1))",
  },
}

export function ProfitChart({ data }: ProfitChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Receita vs. Custo vs. Lucro</CardTitle>
        <CardDescription>
          Análise do seu desempenho financeiro nos últimos 6 meses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ComposedChart
                data={data}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                        `R$${value / 1000}k`
                    }
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                 <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                        offset="5%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.8}
                        />
                        <stop
                        offset="95%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                        <stop
                        offset="5%"
                        stopColor="var(--color-cost)"
                        stopOpacity={0.8}
                        />
                        <stop
                        offset="95%"
                        stopColor="var(--color-cost)"
                        stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillRevenue)"
                    fillOpacity={0.4}
                    stroke="var(--color-revenue)"
                    stackId="a"
                />
                 <Area
                    dataKey="cost"
                    type="natural"
                    fill="url(#fillCost)"
                    fillOpacity={0.4}
                    stroke="var(--color-cost)"
                    stackId="a"
                />
                <Line dataKey="profit" type="monotone" stroke="var(--color-profit)" strokeWidth={2} dot={false} />
            </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Mostrando receita, custos e lucro dos últimos 6 meses.
        </div>
      </CardFooter>
    </Card>
  )
}
