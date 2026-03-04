
"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Timer, CalendarDays, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressHeaderProps {
  totalRequired: number;
  totalSpent: number;
  isCommandCenter?: boolean;
}

export function ProgressHeader({ totalRequired, totalSpent, isCommandCenter = true }: ProgressHeaderProps) {
  const remaining = Math.max(0, totalRequired - totalSpent);
  const targetPercentage = totalRequired > 0 ? Math.min(100, (totalSpent / totalRequired) * 100) : 0;
  
  // Animation state for the percentage counter and progress bar
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    // Smooth Percentage Count-up Animation with Quartic Easing
    let start = displayPercentage;
    const duration = 2000; // Calibrated duration for professional feel
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quartic ease-out for a very smooth, decelerating finish
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const nextValue = start + (targetPercentage - start) * easeOutQuart;
      setDisplayPercentage(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayPercentage(targetPercentage);
      }
    }

    requestAnimationFrame(animate);
  }, [targetPercentage]);

  return (
    <div className={cn(
      "sticky top-0 z-50 w-full border-b shadow-2xl transition-all duration-500",
      isCommandCenter ? "bg-[#0F172A]/80 backdrop-blur-2xl border-white/5" : "bg-white border-slate-200"
    )}>
      <div className="container mx-auto px-4 h-20 md:h-24 flex items-center">
        <div className="w-full flex items-center justify-between gap-4 md:gap-8">
          {/* Logo & Standard Branding */}
          <div className="flex items-center gap-3 md:gap-5 group cursor-default shrink-0">
            <div className={cn(
              "p-2 md:p-3 rounded-xl md:rounded-2xl transition-all group-hover:scale-110 group-hover:-rotate-6",
              isCommandCenter ? "bg-gradient-to-br from-primary to-accent shadow-[0_10px_25px_rgba(44,167,217,0.3)]" : "bg-primary shadow-lg"
            )}>
              <CalendarDays className="h-5 md:h-7 w-5 md:w-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-baseline">
                <h1 className={cn(
                  "text-xl md:text-2xl font-black tracking-tighter",
                  isCommandCenter ? "text-white" : "text-slate-900"
                )}>
                  Intern
                </h1>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-primary">
                  Days
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  isCommandCenter ? "bg-primary shadow-[0_0_10px_rgba(44,167,217,0.8)]" : "bg-primary"
                )} />
                <p className={cn(
                  "text-[9px] md:text-[10px] font-black uppercase tracking-widest",
                  isCommandCenter ? "text-slate-400" : "text-slate-500"
                )}>Journal</p>
              </div>
            </div>
          </div>

          {/* Central Progress Section */}
          <div className="flex-1 max-w-xl hidden lg:block">
            <div className={cn(
              "border p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] transition-all backdrop-blur-md shadow-inner",
              isCommandCenter ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100"
            )}>
              <div className="flex justify-between items-end mb-2 md:mb-3 px-1">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <Timer className="h-3 md:h-4 w-3 md:w-4 text-primary" />
                    <span className={cn(
                      "text-[10px] md:text-[11px] font-black uppercase tracking-widest",
                      isCommandCenter ? "text-white" : "text-slate-700"
                    )}>{totalSpent}h Logged</span>
                  </div>
                  <span className={cn("h-3 md:h-4 w-px", isCommandCenter ? "bg-white/10" : "bg-slate-200")} />
                  <div className="flex items-center gap-2">
                    <Target className="h-3 md:h-4 w-3 md:w-4 text-slate-500" />
                    <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">Goal: {totalRequired}h</span>
                  </div>
                </div>
                <span className="text-base md:text-lg font-black text-primary tracking-tighter drop-shadow-sm">
                  {Math.round(displayPercentage)}%
                </span>
              </div>
              <Progress 
                value={displayPercentage} 
                className={cn(
                  "h-1.5 md:h-2 transition-none", // Remove standard transition to let our JS animation drive it smoothly
                  isCommandCenter ? "bg-slate-800" : "bg-slate-200"
                )} 
              />
            </div>
          </div>

          {/* Right Stats & Meta */}
          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-0.5 md:mb-1">Remaining</span>
              <div className="flex items-center gap-2 md:gap-3">
                <span className={cn(
                  "text-2xl md:text-3xl font-black tracking-tighter",
                  remaining > 0 
                    ? (isCommandCenter ? "text-white" : "text-slate-900") 
                    : "text-primary drop-shadow-[0_0_10px_rgba(44,167,217,0.5)]"
                )}>
                  {remaining}h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
