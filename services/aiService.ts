
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
// FIX: Imported the 'Plot' type, which was missing.
import { Activity, Lead, Plot } from "../types";

class AIService {
    private ai: GoogleGenAI;

    constructor() {
        if (!process.env.API_KEY) {
            console.warn("API_KEY environment variable not set. AI features will be mocked.");
            // A mock AI instance to avoid crashing the app.
            this.ai = {
                models: {
                    generateContent: (params: any) => Promise.resolve({ text: "Mock AI response. API key not configured." } as GenerateContentResponse)
                }
            } as any;
        } else {
            this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    }

    private async generateText(prompt: string): Promise<string> {
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Gemini API error:", error);
            throw new Error("Failed to generate content from AI model.");
        }
    }
    
    async summarizeActivities(activities: Activity[]): Promise<string> {
        if (activities.length === 0) return "No activities to summarize.";
        
        const activityLog = activities
            .slice(-5) // Get last 5 activities
            .map(a => `- ${new Date(a.created_at).toLocaleDateString()}: ${a.type} - ${a.summary} (Outcome: ${a.outcome})`)
            .join("\n");
            
        const prompt = `
            You are an expert real estate sales assistant. Summarize the following recent activities with a lead in 2-3 concise bullet points. Focus on the lead's interest level and key requirements mentioned.

            Activities:
            ${activityLog}

            Summary:
        `;
        
        return this.generateText(prompt);
    }
    
    async suggestNextSteps(lead: Lead, activities: Activity[]): Promise<string> {
        const activitySummary = await this.summarizeActivities(activities);
        const prompt = `
            You are a sales coach for a real estate company. Based on the lead's profile and a summary of recent activities, suggest 2-3 specific, actionable next steps to move the deal forward.

            Lead Profile:
            - Status: ${lead.status}
            - Budget: ${lead.budget_min} to ${lead.budget_max}
            - Interest: Project IDs ${lead.project_interest_ids.join(", ")}, prefers ${lead.plot_size_pref} sqft plots.

            Activity Summary:
            ${activitySummary}

            Suggested Next Steps (provide as a bulleted list):
        `;
        
        return this.generateText(prompt);
    }

    async suggestPlots(lead: Lead): Promise<string> {
        const prompt = `
            A real estate lead has the following preferences:
            - Interested in Project IDs: ${lead.project_interest_ids.join(', ')}
            - Budget: ${lead.budget_min} to ${lead.budget_max}
            - Preferred Size: Around ${lead.plot_size_pref} sqft

            Based on this, suggest 2-3 suitable plot types or specific blocks within those projects that would be a good match.
            Briefly explain why each suggestion is a good fit.
        `;
        
        return this.generateText(prompt);
    }
    
    async generateOfferContent(plot: Plot, lead: Lead): Promise<string> {
        const prompt = `
            Generate a concise and professional offer summary for a real estate plot. Use markdown for formatting.

            Plot Details:
            - Project: ${plot.project_id}
            - Plot No: ${plot.plot_no}
            - Size: ${plot.size} ${plot.size_unit}
            - Facing: ${plot.facing}
            - Rate per ${plot.size_unit}: ${plot.current_rate}

            Lead Details:
            - Name: ${lead.first_name} ${lead.last_name}

            Calculation:
            - Agreement Value: ${plot.size * plot.current_rate}

            Generate the offer summary now.
        `;

        return this.generateText(prompt);
    }
}

export const aiService = new AIService();
