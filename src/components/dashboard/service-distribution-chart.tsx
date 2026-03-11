
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
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="items-center pb-2 pt-4">
        <CardTitle className="font-headline text-xl">Distribuição de Serviços</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-widest font-bold">
          Detalhamento dos tipos de pedidos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex flex-col justify-center">
        <ChartContainer
          config={chartConfig}
          id={id}
          className="mx-auto aspect-square max-h-[240px] w-full"
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
                        className="h-2 w-2 shrink-0 rounded-[2px]" 
                        style={{ backgroundColor: (item as any).payload.fill }} 
                      />
                      <div className="flex flex-1 justify-between gap-4 leading-none">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{name}</span>
                        <span className="font-mono font-black tabular-nums text-foreground text-xs">
                          {value}
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
              innerRadius={50}
              outerRadius={80}
              strokeWidth={4}
              activeIndex={0}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 6} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius}
                    innerRadius={outerRadius - 6}
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
              className="flex-wrap gap-x-4 gap-y-1 [&>*]:basis-1/4 [&>*]:justify-center text-[9px] uppercase font-bold"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="justify-center pb-4 pt-2 flex items-center">
        {totalOrders > 0 && (
          <div className="flex items-center justify-center text-center">
            <span className="text-xl font-black">
              {totalOrders}
            </span>
            <span className="ml-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Itens Totais
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={className}>{children}</div>
}
