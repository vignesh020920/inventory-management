// components/ui/search-input.tsx
import { Input } from "./input";
import { Search, Calendar as CalendarIcon, Mail } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type SearchType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "date-range"
  | "select";

interface SearchInputProps {
  searchKey: string;
  searchType?: SearchType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

export function SearchInput({
  searchKey,
  searchType = "text",
  placeholder,
  options,
  value,
  onChange,
  className,
}: SearchInputProps) {
  switch (searchType) {
    case "date":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                className
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value
                ? format(value, "PPP")
                : placeholder || `Search ${searchKey}...`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      );

    case "date-range":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                className
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "LLL dd, y")} -{" "}
                    {format(value.to, "LLL dd, y")}
                  </>
                ) : (
                  format(value.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      );

    case "select":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={className}>
            <SelectValue
              placeholder={placeholder || `Filter ${searchKey}...`}
            />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "email":
      return (
        <div className="relative w-full">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder={placeholder || `Search ${searchKey}...`}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn("pl-9", className)}
          />
        </div>
      );

    case "number":
      return (
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder={placeholder || `Search ${searchKey}...`}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={cn("pl-9", className)}
          />
        </div>
      );

    default: // text
      return (
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder || `Search ${searchKey}...`}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn("pl-9", className)}
          />
        </div>
      );
  }
}
