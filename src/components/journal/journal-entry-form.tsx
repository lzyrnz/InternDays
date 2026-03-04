
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Clock, BookOpen, ClipboardCheck, Palmtree, Trash2, ShieldAlert } from "lucide-react";
import { JournalEntry } from "@/app/lib/types";
import { cn } from "@/lib/utils";

interface JournalEntryFormProps {
  selectedDate: Date;
  existingEntry?: JournalEntry;
  onSave: (entry: Omit<JournalEntry, "id">) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  isCommandCenter?: boolean;
}

export function JournalEntryForm({ selectedDate, existingEntry, onSave, onDelete, onCancel, isCommandCenter = true }: JournalEntryFormProps) {
  const [tasks, setTasks] = useState(existingEntry?.tasks || "");
  const [learnings, setLearnings] = useState(existingEntry?.learnings || "");
  const [hours, setHours] = useState(existingEntry?.hours.toString() || "8");
  const [isHoliday, setIsHoliday] = useState(existingEntry?.isHoliday || false);

  const cachedWorkValues = useRef({
    tasks: existingEntry?.isHoliday ? "" : (existingEntry?.tasks || ""),
    learnings: existingEntry?.isHoliday ? "" : (existingEntry?.learnings || ""),
    hours: existingEntry?.isHoliday ? "8" : (existingEntry?.hours.toString() || "8")
  });

  useEffect(() => {
    if (isHoliday) {
      if (tasks !== "Holiday") {
        cachedWorkValues.current = { tasks, learnings, hours };
      }
      setHours("0");
      setTasks("Holiday");
      setLearnings("Holiday break - no learnings logged.");
    } else {
      setTasks(cachedWorkValues.current.tasks);
      setLearnings(cachedWorkValues.current.learnings);
      setHours(cachedWorkValues.current.hours === "0" ? "8" : cachedWorkValues.current.hours);
    }
  }, [isHoliday]);

  const statusInfo = useMemo(() => {
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return { label: isHoliday ? "Holiday" : "No Hours", icon: isHoliday ? Palmtree : ShieldAlert, color: isHoliday ? "text-orange-500" : "text-slate-400" };
    if (h >= 8) return { label: "Full Day", icon: Clock, color: "text-primary" };
    return { label: "Partial Day", icon: Clock, color: "text-accent" };
  }, [hours, isHoliday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: selectedDate.toISOString(),
      tasks: isHoliday ? "Holiday" : tasks,
      learnings: isHoliday ? "Holiday break - no learnings logged." : learnings,
      hours: isHoliday ? 0 : (parseFloat(hours) || 0),
      isHoliday,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={cn(
        "flex items-center justify-between p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-500 shadow-xl",
        isHoliday 
          ? "bg-orange-500/20 border-orange-500/40" 
          : (isCommandCenter ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")
      )}>
        <div className="flex items-center gap-4 md:gap-5">
          <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl transition-colors shadow-lg", isHoliday ? "bg-orange-500 text-white" : "bg-primary/20 text-primary")}>
            <Palmtree className="h-5 md:h-6 w-5 md:w-6" />
          </div>
          <div>
            <p className={cn("text-xs md:text-sm font-black leading-none mb-1 md:mb-2 tracking-tight", isCommandCenter ? "text-white" : "text-slate-900")}>Holiday Mode</p>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              {isHoliday ? "Off Duty" : "Work Day"}
            </p>
          </div>
        </div>
        <Switch 
          checked={isHoliday} 
          onCheckedChange={setIsHoliday}
          className="data-[state=checked]:bg-orange-500 scale-110 md:scale-125"
        />
      </div>

      <div className={cn("space-y-6 md:space-y-10 transition-all duration-500", isHoliday ? "opacity-20 pointer-events-none scale-[0.98] blur-[2px]" : "opacity-100")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4">
            <Label htmlFor="hours" className="flex items-center gap-2 md:gap-3 text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] pl-1">
              <Clock className="h-4 w-4 text-primary" />
              Hours Spent
            </Label>
            <div className="relative group">
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                disabled={isHoliday}
                className={cn(
                  "h-14 md:h-16 text-2xl md:text-4xl font-black rounded-xl md:rounded-2xl pl-12 md:pl-16 transition-all shadow-inner",
                  isCommandCenter 
                    ? "bg-white/5 border-white/5 text-white group-hover:bg-white/10 focus:ring-primary" 
                    : "bg-slate-50 border-slate-200 text-slate-900 group-hover:bg-white focus:ring-primary"
                )}
              />
              <span className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 font-black text-slate-500 text-xl md:text-2xl group-hover:text-primary transition-colors">H</span>
            </div>
          </div>

          <div className="flex items-end">
            <div className={cn(
              "px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] w-full border flex flex-col justify-center h-14 md:h-16 shadow-xl backdrop-blur-md",
              isCommandCenter ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
            )}>
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-0.5 md:mb-1">Status</p>
              <div className="flex items-center gap-2 md:gap-3">
                <statusInfo.icon className={cn("h-4 md:h-5 w-4 md:w-5", statusInfo.color)} />
                <p className={cn("text-base md:text-lg font-black tracking-tighter", statusInfo.color)}>
                  {statusInfo.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <Label htmlFor="tasks" className="flex items-center gap-2 md:gap-3 text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] pl-1">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Tasks Accomplished
            </Label>
            <Textarea
              id="tasks"
              placeholder="What did you work on today?"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              disabled={isHoliday}
              className={cn(
                "min-h-[100px] md:min-h-[140px] resize-none rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 font-bold text-base md:text-lg leading-relaxed transition-all shadow-inner",
                isCommandCenter 
                  ? "bg-white/5 border-white/5 text-white hover:bg-white/10 focus:ring-primary placeholder:text-slate-700" 
                  : "bg-slate-50 border-slate-200 text-slate-900 hover:bg-white focus:ring-primary placeholder:text-slate-400"
              )}
            />
          </div>

          <div className="space-y-3 md:space-y-4">
            <Label htmlFor="learnings" className="flex items-center gap-2 md:gap-3 text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] pl-1">
              <BookOpen className="h-4 w-4 text-primary" />
              Key Learnings
            </Label>
            <Textarea
              id="learnings"
              placeholder="What did you learn today?"
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              disabled={isHoliday}
              className={cn(
                "min-h-[100px] md:min-h-[140px] resize-none rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 font-bold text-base md:text-lg leading-relaxed transition-all shadow-inner",
                isCommandCenter 
                  ? "bg-white/5 border-white/5 text-white hover:bg-white/10 focus:ring-primary placeholder:text-slate-700" 
                  : "bg-slate-50 border-slate-200 text-slate-900 hover:bg-white focus:ring-primary placeholder:text-slate-400"
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-5 pt-4 md:pt-8">
        <div className="flex gap-4 md:gap-5">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className={cn(
              "flex-1 h-12 md:h-16 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all active:scale-95 text-[10px] md:text-[11px]",
              isCommandCenter ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className={cn(
              "flex-[2.5] h-12 md:h-16 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all active:scale-95 text-xs md:text-sm shadow-xl border-none",
              isHoliday 
                ? "bg-orange-500 hover:bg-orange-600" 
                : "bg-primary hover:bg-primary/90"
            )}
          >
            <Save className="mr-2 md:mr-3 h-4 md:h-6 w-4 md:w-6" />
            {isHoliday ? "Save Holiday" : "Save Entry"}
          </Button>
        </div>
        
        {existingEntry && onDelete && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onDelete(existingEntry.id)}
            className={cn(
              "h-12 md:h-14 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center justify-center gap-2 md:gap-3 border group transition-all active:scale-95 text-[9px] md:text-[10px]",
              isCommandCenter
                ? "bg-red-500/5 border-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-white"
                : "bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white"
            )}
          >
            <Trash2 className="h-3.5 md:h-4 w-3.5 md:w-4 group-hover:rotate-12 transition-transform" />
            Delete Entry
          </Button>
        )}
      </div>
    </form>
  );
}
