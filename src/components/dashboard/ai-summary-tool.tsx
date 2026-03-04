"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { generateLearningSummary } from "@/ai/flows/learning-summary-generator";

interface AISummaryToolProps {
  learnings: string[];
}

export function AISummaryTool({ learnings }: AISummaryToolProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (learnings.length === 0) return;
    setLoading(true);
    try {
      const result = await generateLearningSummary({ keyLearnings: learnings });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm border border-primary/10">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <BrainCircuit className="h-5 w-5" />
            AI Learning Analysis
          </CardTitle>
          <CardDescription>
            Synthesize your training insights automatically.
          </CardDescription>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={loading || learnings.length === 0}
          variant="secondary"
          size="sm"
          className="bg-accent hover:bg-accent/90 text-white font-semibold"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate Insights
        </Button>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="bg-white p-4 rounded-lg border border-accent/20 text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-500">
            {summary}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-muted/30">
            {learnings.length === 0 
              ? "Start journaling to generate summaries." 
              : "Click generate to see your learning themes."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}