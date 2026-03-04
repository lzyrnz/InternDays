"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  useUser, 
  useFirestore, 
  useAuth,
  useCollection, 
  useDoc, 
  useMemoFirebase,
  updateDocumentNonBlocking,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { ProgressHeader } from "@/components/dashboard/progress-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { OJTCalendar } from "@/components/calendar/ojt-calendar";
import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { SettingsDialog } from "@/components/dashboard/settings-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, CalendarDays, ScrollText, ArrowRight, Sparkles, Palmtree, LogOut, Loader2 } from "lucide-react";
import { JournalEntry } from "@/app/lib/types";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";

export default function InternDays() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);
  const { data: profileData } = useDoc(profileRef);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid, "ojtSessions", "default");
  }, [firestore, user]);
  const { data: settingsData, isLoading: isSettingsLoading } = useDoc(settingsRef);

  const entriesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "dailyJournalEntries");
  }, [firestore, user]);
  const { data: entriesData, isLoading: isEntriesLoading } = useCollection(entriesRef);

  const totalRequiredHours = settingsData?.totalRequiredHours || 300;
  const excludeWeekends = settingsData?.excludeWeekends ?? true;
  const isCommandCenter = settingsData?.commandCenterEnabled ?? true;
  
  const entries: JournalEntry[] = (entriesData || []).map(e => ({
    id: e.id,
    date: e.entryDate,
    tasks: e.tasksAccomplished,
    learnings: e.keyLearnings,
    hours: e.hoursLogged,
    isHoliday: e.hoursLogged === 0 && (e.tasksAccomplished === "Holiday" || e.isHoliday === true)
  }));

  const totalSpent = entries.reduce((acc, entry) => acc + entry.hours, 0);
  
  const selectedEntry = selectedDate 
    ? entries.find(e => isSameDay(new Date(e.date), selectedDate))
    : undefined;

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    setIsEntryDialogOpen(true);
  };

  const handleSaveEntry = (newEntryData: Omit<JournalEntry, "id">) => {
    if (!user || !firestore) return;

    const entryPayload = {
      userId: user.uid,
      entryDate: newEntryData.date,
      tasksAccomplished: newEntryData.tasks,
      keyLearnings: newEntryData.learnings,
      hoursLogged: newEntryData.hours,
      isHoliday: newEntryData.isHoliday || false,
      updatedAt: new Date().toISOString(),
      createdAt: selectedEntry ? (selectedEntry as any).createdAt || new Date().toISOString() : new Date().toISOString(),
    };

    if (selectedEntry) {
      const entryRef = doc(firestore, "users", user.uid, "dailyJournalEntries", selectedEntry.id);
      updateDocumentNonBlocking(entryRef, entryPayload);
    } else {
      const entriesColRef = collection(firestore, "users", user.uid, "dailyJournalEntries");
      addDocumentNonBlocking(entriesColRef, entryPayload);
    }
    setIsEntryDialogOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (!user || !firestore) return;
    const entryRef = doc(firestore, "users", user.uid, "dailyJournalEntries", id);
    deleteDocumentNonBlocking(entryRef);
    setIsEntryDialogOpen(false);
  };

  const handleUpdateSettings = (hours: number, skipWeekends: boolean, commandCenterEnabled: boolean, firstName: string) => {
    if (!user || !firestore || !settingsRef || !profileRef) return;
    
    setDocumentNonBlocking(settingsRef, {
      id: "default",
      userId: user.uid,
      totalRequiredHours: hours,
      excludeWeekends: skipWeekends,
      commandCenterEnabled: commandCenterEnabled,
      startDate: settingsData?.startDate || new Date().toISOString().split('T')[0],
      endDate: settingsData?.endDate || new Date().toISOString().split('T')[0],
      ojtWeekdays: settingsData?.ojtWeekdays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      createdAt: settingsData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    setDocumentNonBlocking(profileRef, {
      id: user.uid,
      firstName: firstName,
      lastName: profileData?.lastName || "",
      email: user.email || "",
      createdAt: profileData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  if (isUserLoading || isSettingsLoading || isEntriesLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", isCommandCenter ? "bg-[#0F172A]" : "bg-slate-50")}>
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const trainingEntries = entries.filter(e => !e.isHoliday);
  const holidayEntries = entries.filter(e => e.isHoliday);
  const displayName = profileData?.firstName || user.displayName || user.email?.split('@')[0] || "Intern";

  return (
    <div className={cn(
      "min-h-screen font-body pb-20 selection:bg-primary selection:text-white relative overflow-hidden transition-colors duration-500",
      isCommandCenter ? "bg-[#0F172A]" : "bg-slate-50"
    )}>
      {isCommandCenter && (
        <>
          <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-float opacity-30 pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-accent/10 rounded-full blur-[150px] animate-float-reverse opacity-30 pointer-events-none" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        </>
      )}

      <ProgressHeader 
        totalRequired={totalRequiredHours} 
        totalSpent={totalSpent} 
        isCommandCenter={isCommandCenter}
      />

      <main className="container mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-1000 slide-in-from-top-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 group cursor-default">
            <h1 className={cn(
              "text-6xl font-black tracking-tighter",
              isCommandCenter ? "text-white drop-shadow-xl" : "text-slate-900"
            )}>
              Hi, {displayName}!
            </h1>
            <p className={cn(
              "font-black uppercase tracking-[0.4em] text-[10px] py-1.5 px-4 rounded-full inline-block ml-1",
              isCommandCenter ? "text-primary bg-primary/10" : "text-slate-500 bg-slate-200"
            )}>
              Training Journal
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "rounded-2xl px-8 h-14 font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex-1 md:flex-none",
                isCommandCenter 
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-white backdrop-blur-md" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Settings className="mr-3 h-4 w-4 text-primary" />
              Journal Settings
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className={cn(
                "rounded-2xl h-14 px-6 border transition-all shadow-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest",
                isCommandCenter
                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 backdrop-blur-md"
                  : "bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white"
              )}
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        <StatsCards 
          totalRequired={totalRequiredHours} 
          totalSpent={totalSpent} 
          entries={entries}
          excludeWeekends={excludeWeekends}
          isCommandCenter={isCommandCenter}
        />

        <div className={cn(
          "rounded-[3.5rem] overflow-hidden border shadow-2xl transition-all duration-500",
          isCommandCenter ? "border-white/10" : "border-slate-200 bg-white"
        )}>
          <OJTCalendar 
            selectedDate={selectedDate} 
            onSelect={handleDaySelect} 
            entries={entries}
            isCommandCenter={isCommandCenter}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className={cn(
            "lg:col-span-2 shadow-2xl rounded-[3.5rem] overflow-hidden transition-all duration-500",
            isCommandCenter ? "border-white/10 bg-slate-900/60 backdrop-blur-3xl" : "border-slate-200 bg-white"
          )}>
            <CardHeader className={cn(
              "pb-4 border-b px-10 pt-10",
              isCommandCenter ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50/50"
            )}>
              <div className="flex items-center justify-between">
                <CardTitle className={cn(
                  "text-3xl flex items-center gap-4 font-black tracking-tighter",
                  isCommandCenter ? "text-white" : "text-slate-900"
                )}>
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border",
                    isCommandCenter ? "bg-primary/20 border-primary/20" : "bg-primary/10 border-primary/20"
                  )}>
                    <ScrollText className="h-6 w-6 text-primary" />
                  </div>
                  Daily Journal
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "font-black px-5 py-2 uppercase tracking-widest text-[10px]",
                    isCommandCenter ? "bg-primary/20 text-primary border-primary/20" : "bg-slate-100 text-slate-600 border-slate-200"
                  )}>
                    {trainingEntries.length} Entries
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] w-full">
                <div className={cn("divide-y", isCommandCenter ? "divide-white/5" : "divide-slate-100")}>
                  {trainingEntries.length > 0 ? (
                    [...trainingEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                        <div 
                          key={entry.id} 
                          className={cn(
                            "group flex items-center justify-between p-10 transition-all cursor-pointer relative overflow-hidden",
                            isCommandCenter ? "hover:bg-white/5" : "hover:bg-slate-50"
                          )} 
                          onClick={() => handleDaySelect(new Date(entry.date))}
                        >
                          <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-2 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out shadow-[0_0_20px_rgba(44,167,217,0.5)]"
                          )} />
                          
                          <div className="flex items-center gap-8 relative z-10">
                            <div className={cn(
                              "text-center min-w-[70px] p-4 rounded-[1.5rem] transition-all duration-500 group-hover:scale-110 shadow-xl border",
                              isCommandCenter 
                                ? "bg-slate-800 border-white/5 group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/20" 
                                : "bg-white border-slate-200 group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/10"
                            )}>
                              <p className={cn(
                                "text-[10px] uppercase font-black mb-1 tracking-widest",
                                isCommandCenter ? "text-slate-500 group-hover:text-white/60" : "text-slate-400 group-hover:text-white/70"
                              )}>{format(new Date(entry.date), "MMM")}</p>
                              <p className={cn(
                                "text-2xl font-black tracking-tighter",
                                isCommandCenter ? "text-white" : "text-slate-800 group-hover:text-white"
                              )}>{format(new Date(entry.date), "dd")}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className={cn(
                                "font-black text-2xl tracking-tighter transition-colors",
                                isCommandCenter ? "text-white group-hover:text-primary" : "text-slate-800 group-hover:text-primary"
                              )}>
                                {entry.tasks || "Working Session"}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3">
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "h-7 px-4 text-[10px] font-black border-none shadow-xl uppercase tracking-widest transition-colors",
                                    isCommandCenter 
                                      ? "bg-slate-800 text-slate-300 group-hover:bg-white group-hover:text-slate-900" 
                                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                                  )}
                                >
                                  {entry.hours}h Logged
                                </Badge>
                                <span className={cn(
                                  "text-xs line-clamp-1 italic font-bold",
                                  isCommandCenter ? "text-slate-400" : "text-slate-500"
                                )}>
                                  {entry.learnings || "No insights recorded yet..."}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "rounded-xl transition-all h-12 w-12 border",
                              isCommandCenter 
                                ? "bg-white/5 hover:bg-primary hover:text-white border-white/5" 
                                : "bg-slate-100 hover:bg-primary hover:text-white border-slate-200"
                            )}
                          >
                            <ArrowRight className="h-6 w-6" />
                          </Button>
                        </div>
                      ))
                  ) : (
                    <div className="py-40 text-center flex flex-col items-center">
                      <div className={cn(
                        "w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 border",
                        isCommandCenter ? "bg-white/5 border-white/5" : "bg-slate-100 border-slate-200"
                      )}>
                        <CalendarDays className={cn("h-12 w-12", isCommandCenter ? "text-slate-700" : "text-slate-300")} />
                      </div>
                      <h3 className={cn("text-3xl font-black tracking-tighter", isCommandCenter ? "text-white" : "text-slate-400")}>No Entries</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Start logging your training progress</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className={cn(
            "shadow-2xl rounded-[3.5rem] overflow-hidden transition-all duration-500",
            isCommandCenter ? "border-white/10 bg-slate-900/60 backdrop-blur-3xl" : "border-slate-200 bg-white"
          )}>
            <CardHeader className={cn(
              "pb-4 border-b px-8 pt-10",
              isCommandCenter ? "border-orange-500/10 bg-orange-500/5" : "border-orange-100 bg-orange-50/50"
            )}>
              <div className="flex items-center justify-between">
                <CardTitle className={cn(
                  "text-2xl flex items-center gap-3 font-black tracking-tighter",
                  isCommandCenter ? "text-white" : "text-slate-900"
                )}>
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center border",
                    isCommandCenter ? "bg-orange-500/20 border-orange-500/20" : "bg-orange-500/10 border-orange-500/20"
                  )}>
                    <Palmtree className="h-5 w-5 text-orange-500" />
                  </div>
                  Holidays
                </CardTitle>
                <Badge className={cn(
                  "font-black px-4 py-1 uppercase tracking-widest text-[9px]",
                  isCommandCenter ? "bg-orange-500/20 text-orange-400 border-orange-500/20" : "bg-orange-100 text-orange-600 border-orange-200"
                )}>
                  {holidayEntries.length} Saved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] w-full">
                <div className={cn("divide-y", isCommandCenter ? "divide-white/5" : "divide-slate-100")}>
                  {holidayEntries.length > 0 ? (
                    [...holidayEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                        <div 
                          key={entry.id} 
                          className={cn(
                            "group flex items-center justify-between p-8 transition-all cursor-pointer relative",
                            isCommandCenter ? "hover:bg-orange-500/5" : "hover:bg-orange-50"
                          )} 
                          onClick={() => handleDaySelect(new Date(entry.date))}
                        >
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "text-center min-w-[50px] p-3 rounded-xl border transition-all shadow-xl",
                              isCommandCenter 
                                ? "bg-slate-800 border-white/5 group-hover:bg-orange-500 group-hover:border-orange-500" 
                                : "bg-white border-slate-200 group-hover:bg-orange-500 group-hover:border-orange-500"
                            )}>
                              <p className={cn(
                                "text-[8px] uppercase font-black tracking-widest",
                                isCommandCenter ? "text-slate-500 group-hover:text-orange-100" : "text-slate-400 group-hover:text-orange-50"
                              )}>{format(new Date(entry.date), "MMM")}</p>
                              <p className={cn(
                                "text-lg font-black tracking-tighter",
                                isCommandCenter ? "text-white" : "text-slate-800 group-hover:text-white"
                              )}>{format(new Date(entry.date), "dd")}</p>
                            </div>
                            <div>
                              <p className={cn(
                                "font-black tracking-tighter transition-colors text-lg",
                                isCommandCenter ? "text-white group-hover:text-orange-400" : "text-slate-800 group-hover:text-orange-600"
                              )}>Off Day</p>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Holiday</p>
                            </div>
                          </div>
                          <ArrowRight className={cn(
                            "h-4 w-4 transition-all",
                            isCommandCenter ? "text-slate-700 group-hover:text-orange-500 group-hover:translate-x-1" : "text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1"
                          )} />
                        </div>
                      ))
                  ) : (
                    <div className="py-32 text-center flex flex-col items-center opacity-20">
                      <Palmtree className="h-16 w-16 text-slate-500 mb-6" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">No holidays logged</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <footer className="pt-24 pb-12 text-center">
          <p className={cn(
            "text-[10px] font-black uppercase tracking-[0.8em] flex items-center justify-center gap-6",
            isCommandCenter ? "text-slate-600" : "text-slate-400"
          )}>
            <span className={cn("h-px w-16", isCommandCenter ? "bg-slate-800" : "bg-slate-200")} />
            Made by lzyrnz
            <span className={cn("h-px w-16", isCommandCenter ? "bg-slate-800" : "bg-slate-200")} />
          </p>
        </footer>
      </main>

      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
        currentHours={totalRequiredHours}
        excludeWeekends={excludeWeekends}
        commandCenterEnabled={isCommandCenter}
        currentFirstName={displayName}
        onSave={handleUpdateSettings}
      />

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className={cn(
          "sm:max-w-[520px] w-[95vw] max-h-[90vh] p-0 border overflow-hidden rounded-[2rem] md:rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col transition-all duration-500",
          isCommandCenter 
            ? "border-white/10 bg-slate-900/90 backdrop-blur-3xl" 
            : "border-slate-200 bg-white"
        )}>
          <DialogHeader className={cn(
            "px-6 md:px-12 py-6 md:py-10 border-b shrink-0",
            isCommandCenter ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
          )}>
            <DialogTitle className={cn(
              "text-2xl md:text-4xl font-black flex items-center gap-4 md:gap-6 tracking-tighter",
              isCommandCenter ? "text-white" : "text-slate-900"
            )}>
              <div className={cn(
                "h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-2xl shrink-0",
                isCommandCenter ? "bg-gradient-to-br from-primary to-accent shadow-primary/30" : "bg-primary shadow-primary/20"
              )}>
                <ScrollText className="h-5 w-5 md:h-8 md:w-8 text-white" />
              </div>
              {selectedDate ? format(selectedDate, "MMM dd") : "Entry Details"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-6 md:px-12 py-6 md:py-10">
              {selectedDate && (
                <JournalEntryForm 
                  selectedDate={selectedDate}
                  existingEntry={selectedEntry}
                  onSave={handleSaveEntry}
                  onDelete={handleDeleteEntry}
                  onCancel={() => setIsEntryDialogOpen(false)}
                  isCommandCenter={isCommandCenter}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
