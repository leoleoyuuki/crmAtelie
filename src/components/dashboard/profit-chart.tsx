
"use client"

import { Area, AreaChart, Bar, BarChart, ComposedChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { EyeOff, TrendingUp } from "lucide-react"
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
import { cn } from "@/lib/utils"

type ProfitChartProps = {
  data: { month: string; revenue: number; cost: number; profit: number }[];
  isPrivacyMode?: boolean;
}

const chartConfig = {
  revenue: {
    label: "Receitas",
    color: "hsl(var(--primary))",
  },
  cost: {
    label: "Despesas",
    color: "hsl(var(--foreground))",
  },
  profit: {
    label: "Lucro",
    color: "hsl(var(--primary))",
  },
}

export function ProfitChart({ data, isPrivacyMode = false }: ProfitChartProps) {
  const latestProfit = data.length > 0 ? data[data.length - 1].profit : 0;
  const isPositive = latestProfit >= 0;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pb-8">
        <CardTitle className="font-headline text-3xl font-black">Balanço Mensal</CardTitle>
        <div className="flex items-start gap-2 mt-2">
            <TrendingUp className={cn("h-4 w-4 mt-0.5", isPositive ? "text-primary" : "text-destructive")} />
            <p className="text-sm text-muted-foreground leading-snug">
                Seu balanço este mês está <span className="font-bold text-foreground">{isPositive ? 'positivo' : 'negativo'}</span> em 
                <span className={cn("font-bold mx-1", isPositive ? "text-primary" : "text-destructive")}>
                    {isPrivacyMode ? 'R$ ●●●,●●' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(latestProfit))}
                </span>.
            </p>
        </div>
        
        {!isPrivacyMode && (
            <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Despesas</span>
                </div>
            </div>
        )}
      </CardHeader>
      <CardContent className="px-0">
        {isPrivacyMode ? (
            <div className="h-[250px] w-full flex flex-col items-center justify-center bg-muted/20 rounded-[2rem] border-2 border-dashed">
                <EyeOff className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-bold text-muted-foreground">Gráfico oculto</p>
            </div>
        ) : (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
                data={data}
                margin={{
                    left: -20,
                    right: 10,
                    top: 10,
                    bottom: 0
                }}
            >
                <defs>
                    <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-profit)"
                            stopOpacity={0.2}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-profit)"
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
                    tickFormatter={(value) => value.toLowerCase()}
                    fontSize={12}
                    fontWeight={600}
                    className="lowercase"
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    fontWeight={600}
                    tickFormatter={(value) => `R$${value}`}
                    hide
                />
                <ChartTooltip
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                    content={
                      <ChartTooltipContent 
                        indicator="dot" 
                        className="bg-background/95 backdrop-blur-md border-primary/20 shadow-2xl rounded-xl"
                        formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                      />
                    }
                />
                
                <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillProfit)"
                    stroke="var(--color-revenue)"
                    strokeWidth={4}
                    dot={{ r: 4, fill: "var(--color-revenue)", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
                 <Line
                    dataKey="cost"
                    type="natural"
                    stroke="var(--color-cost)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-cost)", strokeWidth: 2, stroke: "#fff" }}
                />
            </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
