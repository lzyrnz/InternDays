'use server';
/**
 * @fileOverview A Genkit flow for summarizing key learnings from journal entries.
 *
 * - generateLearningSummary - A function that generates a concise summary or identifies recurring themes from provided key learnings.
 * - LearningSummaryGeneratorInput - The input type for the generateLearningSummary function.
 * - LearningSummaryGeneratorOutput - The return type for the generateLearningSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningSummaryGeneratorInputSchema = z.object({
  keyLearnings: z
    .array(z.string())
    .describe('An array of key learnings extracted from daily journal entries.'),
});
export type LearningSummaryGeneratorInput = z.infer<
  typeof LearningSummaryGeneratorInputSchema
>;

const LearningSummaryGeneratorOutputSchema = z.object({
  summary: z.string().describe('A concise summary or identified recurring themes.'),
});
export type LearningSummaryGeneratorOutput = z.infer<
  typeof LearningSummaryGeneratorOutputSchema
>;

export async function generateLearningSummary(
  input: LearningSummaryGeneratorInput
): Promise<LearningSummaryGeneratorOutput> {
  return learningSummaryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningSummaryPrompt',
  input: {schema: LearningSummaryGeneratorInputSchema},
  output: {schema: LearningSummaryGeneratorOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing learning progress.

Your task is to review the following key learnings from an intern's daily journal entries.
Based on these learnings, provide a concise summary or identify recurring themes in their training experience.

Key Learnings:
{{#each keyLearnings}}
- {{{this}}}
{{/each}}

Focus on synthesizing information, identifying progress, areas of focus, or any patterns that emerge from the entries. The output should be a single string containing this summary or themes.
`,
});

const learningSummaryGeneratorFlow = ai.defineFlow(
  {
    name: 'learningSummaryGeneratorFlow',
    inputSchema: LearningSummaryGeneratorInputSchema,
    outputSchema: LearningSummaryGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
