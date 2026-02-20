
"use client"

import { TrendingUp, EyeOff } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
} from "@/components/ui/chart"

type RevenueChartProps = {
  data: { month: string; revenue: number }[];
  isPrivacyMode?: boolean;
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
}

export function RevenueChart({ data, isPrivacyMode = false }: RevenueChartProps) {
  return (
    <div className="w-full">
        {isPrivacyMode ? (
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-muted/20 rounded-2xl border-2 border-dashed">
                <EyeOff className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-bold text-muted-foreground">Dados financeiros ocultos</p>
                <p className="text-xs text-muted-foreground">Desative o modo de privacidade para visualizar</p>
            </div>
        ) : (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
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
                        stopOpacity={0.3}
                    />
                    <stop
                        offset="95%"
                        stopColor="var(--color-revenue)"
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
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={3}
              activeDot={{
                r: 6,
                fill: "var(--color-revenue)",
                stroke: "white",
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ChartContainer>
        )}
    </div>
  )
}
