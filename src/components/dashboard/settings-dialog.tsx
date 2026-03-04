"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, Settings, CalendarDays, Rocket, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHours: number;
  excludeWeekends: boolean;
  commandCenterEnabled: boolean;
  currentFirstName: string;
  onSave: (hours: number, excludeWeekends: boolean, commandCenterEnabled: boolean, firstName: string) => void;
}

export function SettingsDialog({ open, onOpenChange, currentHours, excludeWeekends, commandCenterEnabled, currentFirstName, onSave }: SettingsDialogProps) {
  const [hours, setHours] = useState(currentHours.toString());
  const [skipWeekends, setSkipWeekends] = useState(excludeWeekends);
  const [isCommandCenter, setIsCommandCenter] = useState(commandCenterEnabled);
  const [firstName, setFirstName] = useState(currentFirstName);

  useEffect(() => {
    setHours(currentHours.toString());
    setSkipWeekends(excludeWeekends);
    setIsCommandCenter(commandCenterEnabled);
    setFirstName(currentFirstName);
  }, [currentHours, excludeWeekends, commandCenterEnabled, currentFirstName, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[480px] w-[95vw] max-h-[90vh] rounded-[2rem] md:rounded-[3.5rem] border shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-0 overflow-hidden flex flex-col transition-colors duration-500",
        isCommandCenter ? "border-white/10 bg-slate-900/90 backdrop-blur-3xl" : "border-slate-200 bg-white"
      )}>
        <DialogHeader className={cn(
          "p-6 md:p-10 border-b shrink-0",
          isCommandCenter ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
        )}>
          <DialogTitle className={cn(
            "flex items-center gap-4 md:gap-5 text-xl md:text-3xl font-black tracking-tighter",
            isCommandCenter ? "text-white" : "text-slate-900"
          )}>
            <div className={cn(
              "h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-[1.25rem] flex items-center justify-center border",
              isCommandCenter ? "bg-primary/20 border-primary/20" : "bg-primary/10 border-primary/20"
            )}>
              <Settings className="h-5 w-5 md:h-7 md:w-7 text-primary" />
            </div>
            Settings
          </DialogTitle>
          <DialogDescription className={cn(
            "font-bold mt-1 text-xs md:text-sm",
            isCommandCenter ? "text-slate-400" : "text-slate-500"
          )}>
            Configure your OJT goal and visual style.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <Label htmlFor="first-name" className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pl-1">
                <User className="h-3 md:h-4 w-3 md:w-4" />
                First Name
              </Label>
              <Input
                id="first-name"
                type="text"
                placeholder="Your name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={cn(
                  "h-12 md:h-16 rounded-xl md:rounded-2xl border font-black text-lg md:text-xl px-4 md:px-6 transition-all",
                  isCommandCenter 
                    ? "bg-white/5 border-white/10 focus:ring-primary focus:border-primary text-white focus:bg-white/10" 
                    : "bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary text-slate-900"
                )}
              />
            </div>

            <div className="space-y-3 md:space-y-4">
              <Label htmlFor="total-hours" className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pl-1">
                <Target className="h-3 md:h-4 w-3 md:w-4" />
                Required Total Hours
              </Label>
              <div className="relative group">
                <Input
                  id="total-hours"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={cn(
                    "h-12 md:h-16 rounded-xl md:rounded-2xl border font-black text-2xl md:text-3xl pl-10 md:pl-14 transition-all",
                    isCommandCenter 
                      ? "bg-white/5 border-white/10 focus:ring-primary focus:border-primary text-white focus:bg-white/10" 
                      : "bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary text-slate-900"
                  )}
                />
                <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 font-black text-slate-600 text-lg md:text-xl group-focus-within:text-primary">#</span>
              </div>
            </div>

            <div className={cn(
              "flex items-center justify-between p-4 md:p-6 rounded-xl md:rounded-[2rem] border transition-colors",
              isCommandCenter ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
            )}>
              <div className="space-y-0.5 md:space-y-1">
                <Label className={cn(
                  "flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]",
                  isCommandCenter ? "text-white" : "text-slate-900"
                )}>
                  <CalendarDays className="h-3 md:h-4 w-3 md:w-4 text-primary" />
                  Exclude Weekends
                </Label>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-wide">Filter weekends from charts</p>
              </div>
              <Switch 
                checked={skipWeekends} 
                onCheckedChange={setSkipWeekends}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className={cn(
              "flex items-center justify-between p-4 md:p-6 rounded-xl md:rounded-[2rem] border transition-colors",
              isCommandCenter ? "bg-primary/10 border-primary/20" : "bg-slate-50 border-slate-100"
            )}>
              <div className="space-y-0.5 md:space-y-1">
                <Label className={cn(
                  "flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]",
                  isCommandCenter ? "text-primary" : "text-slate-900"
                )}>
                  <Rocket className="h-3 md:h-4 w-3 md:w-4 text-primary" />
                  Command Center
                </Label>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-wide">High-end dark theme</p>
              </div>
              <Switch 
                checked={isCommandCenter} 
                onCheckedChange={setIsCommandCenter}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className={cn(
          "p-6 md:p-10 flex gap-3 md:gap-4 shrink-0",
          isCommandCenter ? "bg-black/20" : "bg-slate-50/80"
        )}>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className={cn(
              "flex-1 rounded-xl md:rounded-2xl h-10 md:h-14 font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] transition-all",
              isCommandCenter ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-slate-500 hover:bg-slate-200"
            )}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onSave(parseInt(hours) || 0, skipWeekends, isCommandCenter, firstName);
              onOpenChange(false);
            }}
            className="flex-[1.5] md:flex-[2] rounded-xl md:rounded-2xl h-10 md:h-14 font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] bg-primary hover:bg-primary/90 text-white shadow-xl border-none transition-all active:scale-95"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
