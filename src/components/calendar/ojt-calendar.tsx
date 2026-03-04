
"use client";

import * as React from "react";
import { 
  format, 
  isWeekend, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  isToday,
  addMonths,
  subMonths
} from "date-fns";
import { JournalEntry } from "@/app/lib/types";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, Clock, Palmtree } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OJTCalendarProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
  entries: JournalEntry[];
  isCommandCenter?: boolean;
}

export function OJTCalendar({ selectedDate, onSelect, entries, isCommandCenter = true }: OJTCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getEntryForDate = (date: Date) => {
    return entries.find(e => isSameDay(new Date(e.date), date));
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    setCurrentMonth(now);
    onSelect(now);
  };

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const monthEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  });
  const totalMonthHours = monthEntries.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Calendar Header with Navigation */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-8 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border transition-all duration-500",
        isCommandCenter ? "bg-slate-900/60 backdrop-blur-3xl border-white/10" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-3 md:gap-6">
          <div className={cn(
            "h-10 md:h-16 w-10 md:w-16 rounded-xl md:rounded-3xl flex items-center justify-center shrink-0 border shadow-lg",
            isCommandCenter ? "bg-primary/20 border-primary/20 shadow-[0_0_20px_rgba(44,167,217,0.2)]" : "bg-primary/10 border-primary/20"
          )}>
            <CalendarIcon className="h-5 md:h-8 w-5 md:w-8 text-primary" />
          </div>
          <div>
            <h2 className={cn(
              "text-lg md:text-3xl font-black tracking-tighter drop-shadow-md",
              isCommandCenter ? "text-white" : "text-slate-900"
            )}>
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-3 md:gap-5 mt-0.5 md:mt-2">
              <span className="flex items-center gap-1 text-[8px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <Clock className="h-2.5 md:h-4 w-2.5 md:w-4 text-primary" />
                {totalMonthHours}h
              </span>
              <span className={cn("h-1 w-1 rounded-full", isCommandCenter ? "bg-white/10" : "bg-slate-200")} />
              <span className="flex items-center gap-1 text-[8px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <CheckCircle2 className="h-2.5 md:h-4 w-2.5 md:w-4 text-primary" />
                {monthEntries.length}
              </span>
            </div>
          </div>
        </div>

        <div className={cn("flex items-center gap-1 p-1 md:p-2 rounded-xl md:rounded-2xl border self-end md:self-auto", isCommandCenter ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevMonth} 
            className={cn("h-8 md:h-11 w-8 md:w-11 rounded-lg md:rounded-xl transition-all active:scale-90", isCommandCenter ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-600")}
          >
            <ChevronLeft className="h-4 md:h-5 w-4 md:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleToday}
            className={cn(
              "px-3 md:px-6 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] rounded-lg md:rounded-xl h-8 md:h-11 transition-all active:scale-95",
              isCommandCenter ? "hover:bg-white/10 text-white" : "hover:bg-slate-200 text-slate-900"
            )}
          >
            Today
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth} 
            className={cn("h-8 md:h-11 w-8 md:w-11 rounded-lg md:rounded-xl transition-all active:scale-90", isCommandCenter ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-600")}
          >
            <ChevronRight className="h-4 md:h-5 w-4 md:w-5" />
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className={cn(
        "rounded-[1.25rem] md:rounded-[3.5rem] shadow-2xl border overflow-hidden transition-all duration-500",
        isCommandCenter ? "bg-slate-900/60 backdrop-blur-3xl border-white/10" : "bg-white border-slate-200"
      )}>
        <div className={cn("grid grid-cols-7 border-b", isCommandCenter ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50")}>
          {weekDays.map(day => (
            <div key={day} className="py-3 md:py-6 text-center text-[8px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-slate-500">
              <span className="hidden sm:inline">{day.substring(0, 3)}</span>
              <span className="sm:hidden">{day.substring(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((date) => {
            const entry = getEntryForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isDateInMonth = date.getMonth() === currentMonth.getMonth();
            const isDateToday = isToday(date);
            const isWeekendDay = isWeekend(date);

            return (
              <div
                key={date.toString()}
                onClick={() => onSelect(date)}
                className={cn(
                  "min-h-[60px] sm:min-h-[140px] lg:min-h-[180px] p-1.5 sm:p-5 transition-all cursor-pointer relative group border-r border-b",
                  isCommandCenter ? "border-white/5" : "border-slate-100",
                  !isDateInMonth && (isCommandCenter ? "bg-black/20 opacity-20" : "bg-slate-50 opacity-40"),
                  isSelected && (isCommandCenter ? "bg-primary/5 z-10" : "bg-primary/5 z-10"),
                  isCommandCenter ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                )}
              >
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-1 sm:mb-4">
                  <span className={cn(
                    "text-xs md:text-xl font-black tracking-tighter transition-all",
                    isDateToday ? "text-primary scale-110 md:scale-125 drop-shadow-[0_0_10px_rgba(44,167,217,0.5)]" : (isCommandCenter ? "text-slate-600 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-800"),
                    !isDateInMonth && (isCommandCenter ? "text-slate-800" : "text-slate-300")
                  )}>
                    {format(date, "d")}
                  </span>
                  
                  {entry && (
                    <div className="flex flex-col items-end">
                      {entry.isHoliday ? (
                        <div className="w-5 h-5 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg animate-in fade-in zoom-in duration-500 shrink-0">
                          <Palmtree className="h-2.5 w-2.5 md:h-4 md:w-4" />
                        </div>
                      ) : (
                        <div className={cn(
                          "min-w-[18px] h-5 md:h-8 px-1 md:px-3 flex items-center justify-center rounded-lg font-black text-[7px] md:text-[11px] border-none shadow-md animate-in fade-in zoom-in duration-500",
                          entry.hours >= 8 ? "bg-primary text-white" : (isCommandCenter ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500")
                        )}>
                          {entry.hours}h
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block space-y-1 overflow-hidden">
                  {entry ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className={cn(
                        "line-clamp-2 md:line-clamp-3 text-[10px] md:text-[12px] font-bold leading-tight md:leading-snug transition-colors",
                        isCommandCenter ? "text-slate-400 group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"
                      )}>
                        {entry.tasks || "Journal Entry"}
                      </p>
                    </div>
                  ) : (
                    isWeekendDay && isDateInMonth && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
                        <span className={cn("text-[7px] md:text-[11px] font-black uppercase -rotate-12 tracking-[0.2em] md:tracking-[0.4em]", isCommandCenter ? "text-slate-800" : "text-slate-900")}>Weekend</span>
                      </div>
                    )
                  )}
                </div>

                {isSelected && (
                  <div className="absolute inset-0 border-[1.5px] md:border-4 border-primary/30 pointer-events-none rounded-none shadow-[inset_0_0_15px_rgba(44,167,217,0.1)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
