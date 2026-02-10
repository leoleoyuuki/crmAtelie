
"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export function DatePicker({ date, setDate, className }: { date?: Date, setDate: (date?: Date) => void, className?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          onPointerDown={(e) => {
            // Fix for Safari focus management inside nested containers
            if (e.pointerType === 'mouse') e.preventDefault();
          }}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={4}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);
            setOpen(false);
          }}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * DatePickerWithDialog - A more robust date picker that uses a Modal (Dialog)
 * instead of a Popover. This is significantly more reliable in Safari/macOS
 * when used inside other modals or complex forms.
 */
export function DatePickerWithDialog({ date, setDate, className }: { date?: Date, setDate: (date?: Date) => void, className?: string }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal h-10 px-3 py-2 transition-all",
                        !date && "text-muted-foreground",
                        className
                    )}
                    onPointerDown={(e) => {
                        // Crucial fix for Safari: prevent pointer events from interfering with focus trap
                        if (e.pointerType === 'mouse') e.preventDefault();
                    }}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                    <span className="truncate">
                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-transparent shadow-none focus-visible:outline-none">
                <div className="flex justify-center p-4 bg-popover rounded-xl border shadow-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-4">
                        <DialogHeader className="px-2 pt-2 text-center border-b pb-2 space-y-0">
                            <DialogTitle className="font-semibold text-sm font-headline text-center">Selecionar Data de Entrega</DialogTitle>
                        </DialogHeader>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                                setDate(newDate);
                                setOpen(false);
                            }}
                            initialFocus
                            locale={ptBR}
                        />
                        <div className="p-2 border-t flex justify-end">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
