import { GoogleGenAI, Type } from "@google/genai";
import { GenerateExamParams, Exam } from "../types";

// Service to generate elementary math exams using Gemini AI
export const generateMathExam = async (params: GenerateExamParams): Promise<Partial<Exam>> => {
  // Fix: Always use the direct process.env.API_KEY when initializing GoogleGenAI as per coding guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert Primary School Teacher in Iran (معلم دبستان), working for "Aftab Elementary Schools". 
    Output must be in Persian (Farsi).
    Questions must be age-appropriate for ${params.gradeLevel}.
    Use segments to separate RTL Persian text from LTR Math expressions.
  `;

  let userPrompt = `
    Create a Math Exam. Topic: ${params.topic}, Grade: ${params.gradeLevel}, Difficulty: ${params.difficulty}, Count: ${params.questionCount}.
    ${params.sourceMaterial ? `Base questions on this content: ${params.sourceMaterial}` : ""}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High-reasoning model suitable for STEM/Math tasks
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Type of question: multiple_choice, descriptive, or fill_in_blank" },
                  segments: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING, description: "Segment type: 'text' or 'math'" },
                        content: { type: Type.STRING }
                      },
                      required: ["type", "content"],
                      propertyOrdering: ["type", "content"]
                    }
                  },
                  points: { type: Type.NUMBER }
                },
                required: ["type", "segments", "points"],
                propertyOrdering: ["type", "segments", "points"]
              }
            }
          },
          required: ["title", "questions"],
          propertyOrdering: ["title", "questions"]
        }
      }
    });

    // Extract text directly from the response property as per SDK guidelines (do not call text())
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini API returned an empty response.");
    }

    const parsedData = JSON.parse(responseText.trim());
    return {
      title: parsedData.title,
      questions: parsedData.questions.map((q: any, i: number) => ({
        ...q,
        id: `q-${Date.now()}-${i}`,
        // Provide a joined version of question text for simpler components
        questionText: q.segments.map((s: any) => s.content).join(' ')
      })),
      rawContent: responseText
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};