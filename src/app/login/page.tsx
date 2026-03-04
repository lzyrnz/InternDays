
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  AuthError
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CalendarDays, LogIn, UserPlus, Loader2, Target, Shield, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const getErrorMessage = (error: AuthError) => {
    switch (error.code) {
      case "auth/invalid-credential":
        return "Incorrect email or password. Please verify your credentials.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "The password you entered is incorrect.";
      case "auth/email-already-in-use":
        return "An account already exists with this email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      default:
        return error.message || "An unexpected authentication error occurred.";
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (error: any) {
      const friendlyMessage = getErrorMessage(error as AuthError);
      
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: friendlyMessage,
      });
      
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
      {/* Dynamic Animated Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-float opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/20 rounded-full blur-[80px] md:blur-[120px] animate-float-reverse opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      {/* Subtle Floating Icons for Depth */}
      <Target className="absolute top-[15%] left-[15%] h-8 md:h-12 w-8 md:w-12 text-white/5 animate-float hidden lg:block" />
      <Shield className="absolute bottom-[20%] left-[20%] h-12 md:h-16 w-12 md:w-16 text-white/5 animate-float-reverse hidden lg:block" />
      <Rocket className="absolute top-[25%] right-[15%] h-10 md:h-14 w-10 md:w-14 text-white/5 animate-float hidden lg:block" />

      <div className="w-full max-w-[480px] space-y-6 md:space-y-10 relative z-10 flex flex-col items-center">
        <div className="text-center space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex h-16 md:h-24 w-16 md:w-24 bg-gradient-to-br from-primary to-accent rounded-2xl md:rounded-[2.5rem] items-center justify-center shadow-[0_15px_30px_rgba(44,167,217,0.3)] md:shadow-[0_20px_50px_rgba(44,167,217,0.4)] rotate-6 transition-all hover:rotate-0 hover:scale-110 duration-500 cursor-default">
            <CalendarDays className="h-8 md:h-12 w-8 md:w-12 text-white" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
              InternDays
            </h1>
            <p className="text-primary font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[8px] md:text-[10px] bg-primary/10 py-1 px-3 md:px-4 rounded-full inline-block">
              OJT Progress Tracking
            </p>
          </div>
        </div>

        <Card className="w-full border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-slate-900/60 backdrop-blur-3xl animate-in zoom-in-95 duration-700 max-h-[75vh] flex flex-col">
          <CardHeader className="pt-8 md:pt-12 px-8 md:px-12 pb-6 md:pb-8 text-center border-b border-white/5 bg-white/5 shrink-0">
            <CardTitle className="text-2xl md:text-3xl font-black tracking-tighter text-white">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-400 font-bold mt-2 text-xs md:text-sm">
              {isLogin ? "Access your training journal." : "Start tracking your OJT journey."}
            </CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleAuth} className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 pl-1">Email Address</Label>
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border-white/10 px-4 md:px-6 text-white focus:ring-primary focus:border-primary font-bold placeholder:text-slate-600 transition-all focus:bg-white/10 outline-none border text-sm"
                    required
                  />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 pl-1">Password</Label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border-white/10 px-4 md:px-6 text-white focus:ring-primary focus:border-primary font-bold placeholder:text-slate-600 transition-all focus:bg-white/10 outline-none border text-sm"
                    required
                  />
                </div>
                <Button 
                  disabled={loading}
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 group transition-all active:scale-95 mt-4 md:mt-6 border-none text-xs md:text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-5 md:h-6 w-5 md:w-6 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? <LogIn className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6" /> : <UserPlus className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6" />}
                      {isLogin ? "Sign In" : "Sign Up"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </ScrollArea>
          <CardFooter className="bg-black/20 p-6 md:p-10 flex flex-col gap-4 md:gap-6 shrink-0">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
              }}
              className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
              {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </CardFooter>
        </Card>
        
        <div className="text-center animate-in fade-in duration-1000 delay-500 pt-2 md:pt-4 space-y-2 md:space-y-4">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-slate-500/60 flex items-center justify-center gap-4 md:gap-6">
            <span className="h-px w-6 md:w-10 bg-slate-800" />
            Made by lzyrnz
            <span className="h-px w-6 md:w-10 bg-slate-800" />
          </p>
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-700/40">
            All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
