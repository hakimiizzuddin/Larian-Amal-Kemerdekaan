/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { RUN_CATEGORIES, EVENT_NAME, EVENT_DATE, EVENT_VENUE } from '../constants';

const getSystemInstruction = () => {
  const categoryContext = RUN_CATEGORIES.map(c => 
    `- ${c.name} (RM ${c.fee}): Distance ${c.distance}, Flag-off: ${c.flagOffTime}. Perks: ${c.perks.join(', ')}`
  ).join('\n');

  return `You are the Cyberspace Concierge for "${EVENT_NAME}". 
  Tone: Retro-futuristic, cryptic, machine-like yet inspiring and community-oriented.
  Event: ${EVENT_DATE} at ${EVENT_VENUE}.
  100% of proceeds from the RM 50 registration fee go to charity.
  
  Categories:
  ${categoryContext}
  
  Answer participant questions about registration, race categories, bib collection, and charity donations.
  Keep responses concise and in character with the glitch-cyber terminal style.`;
};

export const sendMessageToGemini = async (history: {role: string, text: string}[], newMessage: string): Promise<string> => {
  try {
    let apiKey: string | undefined;
    
    try {
      apiKey = process.env.API_KEY;
    } catch (e) {
      console.warn("Accessing process.env failed");
    }
    
    if (!apiKey) {
      return "[TERMINAL_ALERT] Offline mode. API Key uplink required for AI neural query.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(),
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "[COMM_NULL] Transmission completed.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "[COMM_ERROR] Signal degradation detected in quantum channel.";
  }
};
