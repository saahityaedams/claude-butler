import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

function extractMessages(noteText: string): Message[] {
  const messages: Message[] = [];
  const parts = noteText.split("\n\nClaude's response:\n");
  
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      // Remove trailing horizontal rule from last part if it exists
      part = part.replace(/\n\n---\n$/, '');
    }
    
    if (part.trim()) {
      if (index === 0) {
        // First part is always user message
        messages.push({ role: "user", content: part.trim() });
      } else {
        // Subsequent parts are Claude responses followed by user messages
        const [response, ...userParts] = part.split("\n\n---\n");
        messages.push({ role: "assistant", content: response.trim() });
        
        const userMessage = userParts.join("\n\n---\n").trim();
        if (userMessage) {
          messages.push({ role: "user", content: userMessage });
        }
      }
    }
  });

  return messages;
}

export async function getClaudeResponse(noteText: string): Promise<string> {
  try {
    const messages = extractMessages(noteText);
    
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: messages,
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error("Error calling Claude:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
}
