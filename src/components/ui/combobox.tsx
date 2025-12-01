
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxProps = {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  onInputChange?: (value: string) => void;
  className?: string;
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção...",
  searchPlaceholder = "Buscar opção...",
  notFoundText = "Nenhuma opção encontrada.",
  onInputChange,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("");

  const handleInputChange = (search: string) => {
    setInputValue(search);
    if (onInputChange) {
        onInputChange(search);
    }
  }

  return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
            >
            {value
                ? options.find((option) => option.value === value)?.label ?? value
                : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent 
            className="w-[--radix-popover-trigger-width] p-0"
        >
            <Command>
            <CommandInput 
                placeholder={searchPlaceholder} 
                value={inputValue}
                onValueChange={handleInputChange}
            />
            <CommandList>
                <CommandEmpty>{notFoundText}</CommandEmpty>
                <CommandGroup>
                    {options.map((option) => (
                    <CommandItem
                        key={option.value}
                        onSelect={() => {
                           onChange(option.value);
                           setOpen(false)
                           setInputValue("")
                           if (onInputChange) onInputChange("");
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        {option.label}
                    </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
  )
}
