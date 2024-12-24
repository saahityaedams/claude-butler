import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

console.log(process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getClaudeResponse(prompt: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    return message.content[0].text;
  } catch (error) {
    console.error("Error calling Claude:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
}
