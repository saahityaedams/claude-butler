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

interface ClaudeResponse {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
}

export async function generateNoteTitle(content: string): Promise<string> {
  try {
    const tempStr = await AsyncStorage.getItem('claude_temperature');
    const systemPromptEnabled = await AsyncStorage.getItem('system_prompt_enabled') === 'true';
    const systemPrompt = await AsyncStorage.getItem('system_prompt');
    const temperature = tempStr ? parseFloat(tempStr) : 0.7;
    
    const messages = [];
    if (systemPromptEnabled && systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt
      });
    }
    
    messages.push({
      role: "user",
      content: `Generate a short, concise title (max 5 words) for this note. Return ONLY the title, with no additional explanation or punctuation:\n\n${content}`
    });

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 50,
      temperature,
      messages: messages,
    });
    
    return response.content[0].text.trim();
  } catch (error) {
    console.error("Error generating title:", error);
    return "Untitled Note";
  }
}

export async function* getClaudeStreamingResponse(noteText: string): AsyncGenerator<ClaudeResponse> {
  try {
    const systemPromptEnabled = await AsyncStorage.getItem('system_prompt_enabled') === 'true';
    const systemPrompt = await AsyncStorage.getItem('system_prompt');
    
    let messages = extractMessages(noteText);
    if (systemPromptEnabled && systemPrompt) {
      messages = [{
        role: "system",
        content: systemPrompt
      }, ...messages];
    }
    
    const stream = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: messages,
      stream: true,
    });

    let accumulatedText = '';
    
    for await (const messageChunk of stream) {
      if (messageChunk.type === 'content_block_delta') {
        accumulatedText += messageChunk.delta.text;
        yield {
          text: messageChunk.delta.text
        };
      }
    }

    // Final yield with token counts if available
    if (stream.usage) {
      yield {
        text: '',
        inputTokens: stream.usage.input_tokens,
        outputTokens: stream.usage.output_tokens
      };
    }

  } catch (error) {
    console.error("Error streaming from Claude:", error);
    yield {
      text: "Sorry, I encountered an error while processing your request."
    };
  }
}

// Keep the old non-streaming version for compatibility
export async function getClaudeResponse(noteText: string): Promise<ClaudeResponse> {
  try {
    const messages = extractMessages(noteText);
    
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: messages,
    });
    
    return {
      text: response.content[0].text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    };
  } catch (error) {
    console.error("Error calling Claude:", error);
    return {
      text: "Sorry, I encountered an error while processing your request."
    };
  }
}
