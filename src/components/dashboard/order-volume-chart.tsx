"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

type OrderVolumeChartProps = {
  data: { month: string; orders: number }[];
}

const chartConfig = {
  orders: {
    label: "Pedidos",
    color: "hsl(var(--secondary))",
  },
}

export function OrderVolumeChart({ data }: OrderVolumeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Volume de Pedidos - Últimos 6 Meses</CardTitle>
        <CardDescription>
          Contagem total de pedidos recebidos a cada mês.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="dot"
              />}
            />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Crescimento de 8% em relação ao período anterior <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando o volume de pedidos dos últimos 6 meses
        </div>
      </CardFooter>
    </Card>
  )
}
