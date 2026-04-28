
"use client"

import {
  Area,
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { EyeOff, TrendingUp, TrendingDown } from "lucide-react"
import { useContext, useState } from "react"
import { PasswordContext } from "@/contexts/password-context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DataPoint = { month: string; revenue: number; cost: number; profit: number }

type ProfitChartProps = {
  data: DataPoint[]
  isPrivacyMode?: boolean
}

/* ─────────────────────────────────────────────────────────
   CUSTOM TOOLTIP – matches the reference screenshot style:
   ┌──────────────────┐
   │  fev              │
   │  R$ 7.240,00      │  ← Revenue  (primary color dot)
   │  R$ 2.025,00      │  ← Cost     (foreground dot)
   └──────────────────┘
───────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label, isPrivacyMode }: {
  active?: boolean
  payload?: { color: string; value: number; name: string }[]
  label?: string
  isPrivacyMode: boolean
}) {
  if (!active || !payload || payload.length === 0) return null

  const fmt = (v: number) =>
    isPrivacyMode
      ? "R$ ●●●,●●"
      : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

  const revenue = payload.find(p => p.name === "revenue")
  const cost = payload.find(p => p.name === "cost")

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/60 shadow-2xl rounded-2xl px-4 py-3 min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-150">
      {/* Month label */}
      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2.5">
        {label?.toLowerCase()}
      </p>
      {/* Revenue row */}
      {revenue && (
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "hsl(var(--primary))" }} />
          <span className="text-[13px] font-black text-foreground tabular-nums">{fmt(revenue.value)}</span>
        </div>
      )}
      {/* Cost row */}
      {cost && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0 bg-foreground/70" />
          <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">{fmt(cost.value)}</span>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   MONTH PILLS STRIP – bottom legend with active highlight
───────────────────────────────────────────────────────── */
function MonthStrip({ data, activeMonth }: { data: DataPoint[]; activeMonth: string | null }) {
  return (
    <div className="flex gap-1 mt-4 overflow-x-auto pb-1 scrollbar-hide">
      {data.map((d) => {
        const isActive = d.month === activeMonth
        return (
          <div
            key={d.month}
            className={cn(
              "flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            {d.month.toLowerCase()}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export function ProfitChart({ data, isPrivacyMode = false }: ProfitChartProps) {
  const { togglePrivacyMode } = useContext(PasswordContext)
  const [activeMonth, setActiveMonth] = useState<string | null>(null)

  const latestProfit = data.length > 0 ? data[data.length - 1].profit : 0
  const isPositive = latestProfit >= 0

  const fmt = (v: number) =>
    isPrivacyMode
      ? "R$ ●●●,●●"
      : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.abs(v))

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pb-6">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <CardTitle className="font-headline text-2xl font-black">Balanço Mensal</CardTitle>
          {/* Legend pills */}
          {!isPrivacyMode && (
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full bg-foreground/50" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Despesas</span>
              </div>
            </div>
          )}
        </div>

        {/* Subtitle */}
        <div className="flex items-start gap-2 mt-2">
          {isPositive
            ? <TrendingUp className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            : <TrendingDown className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
          }
          <p className="text-sm text-muted-foreground leading-snug">
            Seu balanço este mês está{" "}
            <span className="font-bold text-foreground">{isPositive ? "positivo" : "negativo"}</span> em{" "}
            <span
              className={cn(
                "font-bold mx-1 cursor-pointer hover:underline",
                isPositive ? "text-primary" : "text-destructive"
              )}
              onClick={isPrivacyMode ? togglePrivacyMode : undefined}
            >
              {fmt(latestProfit)}
            </span>.
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {isPrivacyMode ? (
          <div
            className="h-[260px] w-full flex flex-col items-center justify-center bg-muted/20 rounded-[2rem] border-2 border-dashed cursor-pointer hover:bg-muted/30 transition-colors group active:scale-[0.99]"
            onClick={togglePrivacyMode}
          >
            <EyeOff className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
            <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Gráfico oculto</p>
            <p className="text-xs text-muted-foreground">Clique para desbloquear e visualizar</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={data}
                margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state.isTooltipActive && state.activePayload?.[0]) {
                    setActiveMonth(state.activePayload[0].payload.month)
                  }
                }}
                onMouseLeave={() => setActiveMonth(null)}
              >
                <defs>
                  {/* Gradient for area fill */}
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={14}
                  tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--muted-foreground))", opacity: 0.6 }}
                  tickFormatter={(v) => v.slice(0, 3).toLowerCase()}
                />

                <YAxis hide />

                {/* Active vertical reference line */}
                {activeMonth && (
                  <ReferenceLine
                    x={activeMonth}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                  />
                )}

                <Tooltip
                  cursor={false}
                  content={<CustomTooltip isPrivacyMode={isPrivacyMode} />}
                />

                {/* Revenue area */}
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 3,
                  }}
                />

                {/* Cost line */}
                <Line
                  dataKey="cost"
                  type="monotone"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  strokeOpacity={0.45}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{
                    r: 5,
                    fill: "hsl(var(--foreground))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 3,
                    opacity: 0.7,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Month pill strip */}
            <MonthStrip data={data} activeMonth={activeMonth} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
