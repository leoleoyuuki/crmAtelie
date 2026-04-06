"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = {
          default: Info,
          destructive: AlertCircle,
          success: CheckCircle2,
          warning: AlertTriangle,
          info: Info,
        }[variant || "default"] || Info

        return (
          <Toast key={id} variant={variant} {...props} className="gap-4">
            <div className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0">
                    <Icon className="h-5 w-5 opacity-90" />
                </div>
                <div className="grid gap-1">
                {title && <ToastTitle className="text-sm font-bold tracking-tight">{title}</ToastTitle>}
                {description && (
                    <ToastDescription className="text-xs leading-relaxed opacity-80">{description}</ToastDescription>
                )}
                </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
