
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
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="font-headline text-2xl">Receita vs. Custo vs. Lucro</CardTitle>
        <CardDescription>
          Análise do seu desempenho financeiro nos últimos 6 meses.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isPrivacyMode ? (
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-muted/20 rounded-2xl border-2 border-dashed">
                <EyeOff className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-bold text-muted-foreground">Dados financeiros ocultos</p>
                <p className="text-xs text-muted-foreground">Desative o modo de privacidade para visualizar</p>
            </div>
        ) : (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ComposedChart
                data={data}
                margin={{
                    left: 0,
                    right: 0,
                    top: 10,
                    bottom: 0
                }}
            >
                <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0.4}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0}
                        />
                    </linearGradient>
                    <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-cost)"
                            stopOpacity={0.4}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-cost)"
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tickFormatter={(value) => value.slice(0, 3)}
                    fontSize={12}
                    fontWeight={600}
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tickFormatter={(value) =>
                        `R$${value / 1000}k`
                    }
                    fontSize={10}
                    fontWeight={600}
                />
                <ChartTooltip
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={
                      <ChartTooltipContent 
                        indicator="dot" 
                        className="bg-background/95 backdrop-blur-md border-primary/20 shadow-2xl rounded-xl"
                        formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                      />
                    }
                />
                 <ChartLegend content={<ChartLegendContent />} className="pt-4" />
                
                <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillRevenue)"
                    stroke="var(--color-revenue)"
                    strokeWidth={3}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
                 <Area
                    dataKey="cost"
                    type="natural"
                    fill="url(#fillCost)"
                    stroke="var(--color-cost)"
                    strokeWidth={3}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                    dataKey="profit" 
                    type="monotone" 
                    stroke="var(--color-profit)" 
                    strokeWidth={4} 
                    dot={{
                        r: 4,
                        fill: "var(--color-profit)",
                        stroke: "white",
                        strokeWidth: 2
                    }}
                    activeDot={{
                        r: 6,
                        fill: "var(--color-profit)",
                        stroke: "white",
                        strokeWidth: 2
                    }}
                />
            </ComposedChart>
        </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="px-0 pt-4 flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground font-medium">
          Mostrando receita, custos e lucro dos últimos 6 meses.
        </div>
      </CardFooter>
    </Card>
  )
}
