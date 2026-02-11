
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

type ServiceDistributionChartProps = {
  data: { service: string; count: number; fill: string }[];
}

const chartConfig = {
  count: {
    label: "Pedidos",
  }
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
          Detalhamento dos tipos de pedidos no sistema.
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
              content={
                <ChartTooltipContent 
                  hideLabel 
                  formatter={(value, name, item) => (
                    <div className="flex items-center gap-2 w-full">
                      <div 
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]" 
                        style={{ backgroundColor: (item as any).payload.fill }} 
                      />
                      <div className="flex flex-1 justify-between gap-4 leading-none">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {value} itens
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
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
              Itens Totais
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
