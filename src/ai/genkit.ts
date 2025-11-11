'use server';

/**
 * @fileOverview This file configures the Genkit AI instance and sets up a custom model for DeepSeek.
 */

import {genkit, Message} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const deepseekPlugin = {
  name: 'genkit-plugin-deepseek-custom',
  models: [
    {
      name: 'googleai/deepseek-chat',
      label: 'DeepSeek (via Google AI Plugin)',
      supports: {
        media: false,
        systemRole: true,
        tools: true,
        multiturn: true,
        stream: false,
      },
      version: 'deepseek-chat',
      family: 'deepseek',
      async run(request, streamingCallback) {
        const options = {
          ...request.config,
          stream: !!streamingCallback,
        };

        const toDeepSeekRole = (role: Message['role']) => {
          if (role === 'model') return 'assistant';
          if (role === 'tool') return 'user';
          return role;
        };

        const messages = request.messages.map(msg => ({
          role: toDeepSeekRole(msg.role),
          content: msg.content.map(p => {
            if (p.text) return p.text;
            if (p.toolResult) {
              return `{"tool_call_id": "${p.toolResult.id}", "output": ${JSON.stringify(p.toolResult.result)}}`;
            }
            return '';
          }).join('')
        }));

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            tools: request.tools?.map(t => ({type: 'function', function: t.jsonSchema})),
            ...options,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        const choice = result.choices[0];

        const output: Message = { role: 'model', content: [] };
        if (choice.message.content) {
            output.content.push({ text: choice.message.content });
        }
        if (choice.message.tool_calls) {
            output.content.push(...choice.message.tool_calls.map((call: any) => ({
                toolRequest: {
                    id: call.id,
                    name: call.function.name,
                    args: JSON.parse(call.function.arguments),
                }
            })));
        }

        return {
          candidates: [{
            index: choice.index,
            finishReason: choice.finish_reason,
            message: output,
          }],
          usage: {
            inputTokens: result.usage.prompt_tokens,
            outputTokens: result.usage.completion_tokens,
            totalTokens: result.usage.total_tokens,
          },
        };
      },
    },
  ],
};


export const ai = genkit({
  plugins: [
    googleAI(),
    deepseekPlugin,
  ],
});
