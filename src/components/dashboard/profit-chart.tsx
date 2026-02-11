"use client"

import { Area, AreaChart, Bar, BarChart, ComposedChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { EyeOff } from "lucide-react"
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
  isPrivacyMode?: boolean;
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

export function ProfitChart({ data, isPrivacyMode = false }: ProfitChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Receita vs. Custo vs. Lucro</CardTitle>
        <CardDescription>
          Análise do seu desempenho financeiro nos últimos 6 meses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPrivacyMode ? (
            <div className="h-[250px] w-full flex flex-col items-center justify-center bg-muted/50 rounded-lg">
                <EyeOff className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Dados financeiros ocultos</p>
                <p className="text-xs text-muted-foreground">Desative o modo de privacidade para visualizar</p>
            </div>
        ) : (
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
                        indicator="line" 
                        formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                      />
                    }
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
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Mostrando receita, custos e lucro dos últimos 6 meses.
        </div>
      </CardFooter>
    </Card>
  )
}
