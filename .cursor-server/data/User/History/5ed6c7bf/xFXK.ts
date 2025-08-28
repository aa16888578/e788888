import { Anthropic } from '@anthropic-ai/sdk';

export class ClaudeService {
  private anthropic: Anthropic;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateCode(prompt: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Claude AI 錯誤:', error);
      throw new Error('代碼生成失敗');
    }
  }

  async reviewCode(code: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `請審查以下代碼並提供改進建議：\n\n${code}`
          }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Claude AI 錯誤:', error);
      throw new Error('代碼審查失敗');
    }
  }

  async explainCode(code: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `請解釋以下代碼的功能和邏輯：\n\n${code}`
          }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Claude AI 錯誤:', error);
      throw new Error('代碼解釋失敗');
    }
  }

  async suggestRefactoring(code: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: `請為以下代碼提供重構建議，重點關注：
1. 代碼可讀性
2. 性能優化
3. 最佳實踐
4. 設計模式應用

代碼：\n\n${code}`
          }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Claude AI 錯誤:', error);
      throw new Error('重構建議生成失敗');
    }
  }
}
