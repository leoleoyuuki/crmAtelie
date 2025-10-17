
"use client"

import * as React from "react"
import { Pie, PieChart, Sector, Cell } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ServiceType } from "@/lib/types"

type ServiceDistributionChartProps = {
  data: { service: string; count: number; fill: string }[];
}

const chartConfig = {
  count: {
    label: "Pedidos",
  },
  Ajuste: {
    label: "Ajuste",
    color: "hsl(var(--chart-1))",
  },
  "Design Personalizado": {
    label: "Design Personalizado",
    color: "hsl(var(--chart-2))",
  },
  Reparo: {
    label: "Reparo",
    color: "hsl(var(--chart-3))",
  },
  "Lavagem a Seco": {
    label: "Lavagem a Seco",
    color: "hsl(var(--chart-4))",
  },
}

export function ServiceDistributionChart({ data }: ServiceDistributionChartProps) {
  const id = "service-distribution"
  const totalOrders = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0)
  }, [data])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Distribuição de Serviços</CardTitle>
        <CardDescription>
          Detalhamento dos tipos de pedidos no último mês.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          id={id}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="service"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius}
                    innerRadius={outerRadius - 8}
                  />
                </g>
              )}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="service" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="flex-1 justify-center pb-4 flex items-center">
        {totalOrders > 0 && (
          <div className="flex items-center justify-center text-center">
            <span className="text-2xl font-bold">
              {totalOrders}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              Pedidos Totais
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
