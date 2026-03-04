
"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Target, Hourglass, TrendingUp, CalendarCheck, Sparkles } from "lucide-react";
import { JournalEntry } from "@/app/lib/types";
import { addDays, format, isWeekend, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalRequired: number;
  totalSpent: number;
  entries: JournalEntry[];
  excludeWeekends: boolean;
  isCommandCenter?: boolean;
}

export function StatsCards({ totalRequired, totalSpent, entries, excludeWeekends, isCommandCenter = true }: StatsCardsProps) {
  const remaining = Math.max(0, totalRequired - totalSpent);
  
  const estimation = useMemo(() => {
    const activeEntries = entries.filter(e => !e.isHoliday && e.hours > 0);
    if (activeEntries.length === 0 || remaining === 0) return null;

    const totalActiveHours = activeEntries.reduce((acc, curr) => acc + curr.hours, 0);
    const avgHoursPerDay = totalActiveHours / activeEntries.length;

    let trainingDaysNeeded = Math.ceil(remaining / avgHoursPerDay);
    let estimatedFinish = new Date();
    let daysToAdvance = 0;
    let countedTrainingDays = 0;

    while (countedTrainingDays < trainingDaysNeeded && daysToAdvance < 730) {
      daysToAdvance++;
      const nextDate = addDays(new Date(), daysToAdvance);
      const isLoggedAsHoliday = entries.some(e => e.isHoliday && isSameDay(new Date(e.date), nextDate));
      const skipThisDay = (excludeWeekends && isWeekend(nextDate)) || isLoggedAsHoliday;
      
      if (!skipThisDay) {
        countedTrainingDays++;
        estimatedFinish = nextDate;
      }
    }

    return {
      date: format(estimatedFinish, "MMM dd, yyyy"),
      days: trainingDaysNeeded,
      avg: avgHoursPerDay.toFixed(1)
    };
  }, [entries, remaining, excludeWeekends]);

  const stats = [
    {
      label: "Total Goal",
      value: `${totalRequired}h`,
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Hours Logged",
      value: `${totalSpent}h`,
      icon: Timer,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Remaining",
      value: `${remaining}h`,
      icon: Hourglass,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Progress",
      value: `${totalRequired > 0 ? Math.round((totalSpent / totalRequired) * 100) : 0}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Est. Finish",
      value: estimation ? estimation.date : "Loading...",
      icon: CalendarCheck,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      description: estimation 
        ? `${estimation.days} Days Left` 
        : "Add more entries"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
      {stats.map((stat, idx) => (
        <Card key={stat.label} className={cn(
          "shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border",
          isCommandCenter ? "border-white/10 bg-slate-900/40 backdrop-blur-xl" : "border-slate-200 bg-white",
          idx === 4 ? "col-span-2 md:col-span-1" : "" // Make the last card full width on mobile grid if needed
        )}>
          <CardContent className="p-4 md:p-6 flex flex-col gap-4 md:gap-6 relative">
            <div className="absolute top-[-10%] right-[-10%] p-2 md:p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none">
              <stat.icon className={`h-16 w-16 md:h-24 md:w-24 ${stat.color} rotate-12`} />
            </div>
            
            <div className={cn(
              "p-2.5 md:p-4 w-fit rounded-xl md:rounded-[1.25rem] border transition-transform group-hover:scale-110 duration-500",
              stat.bg,
              isCommandCenter ? "border-white/5" : "border-slate-100"
            )}>
              <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
            </div>
            
            <div className="relative z-10">
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2">
                {stat.label}
              </p>
              <p className={cn(
                "text-xl md:text-2xl font-black tracking-tighter drop-shadow-md truncate",
                isCommandCenter ? "text-white" : "text-slate-900"
              )}>
                {stat.value}
              </p>
              {"description" in stat && (
                <p className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-1.5 md:mt-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  {stat.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
