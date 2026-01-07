
"use client"

import { Bar, BarChart, ComposedChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
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
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => {
                                const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number);
                                // @ts-ignore
                                return `${formattedValue}`;
                            }}
                        />
                    }
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
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
