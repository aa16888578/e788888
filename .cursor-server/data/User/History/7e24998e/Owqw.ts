import axios from 'axios';

export class CodestralService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = 'BM9Qm7J0N1wmOIFG6mfo5Xr2lOamGWrz';
    this.baseUrl = 'https://codestral.mistral.ai/v1';
  }

  private async makeRequest(endpoint: string, data: any) {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Codestral API 錯誤:', error);
      throw error;
    }
  }

  async generateCode(prompt: string) {
    try {
      const response = await this.makeRequest('/fim/completions', {
        prompt,
        max_tokens: 1000,
        temperature: 0.7,
        stop: ['```']
      });
      return response.choices[0].text;
    } catch (error) {
      console.error('代碼生成錯誤:', error);
      throw new Error('代碼生成失敗');
    }
  }

  async chatCompletion(messages: Array<{role: string; content: string}>) {
    try {
      const response = await this.makeRequest('/chat/completions', {
        messages,
        max_tokens: 1000,
        temperature: 0.7
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('聊天完成錯誤:', error);
      throw new Error('聊天完成失敗');
    }
  }

  async reviewCode(code: string) {
    try {
      const messages = [
        {
          role: 'system',
          content: '你是一個專業的代碼審查者，請審查以下代碼並提供改進建議。'
        },
        {
          role: 'user',
          content: `請審查以下代碼：\n\n${code}`
        }
      ];
      return await this.chatCompletion(messages);
    } catch (error) {
      console.error('代碼審查錯誤:', error);
      throw new Error('代碼審查失敗');
    }
  }

  async explainCode(code: string) {
    try {
      const messages = [
        {
          role: 'system',
          content: '你是一個專業的代碼解釋者，請解釋以下代碼的功能和邏輯。'
        },
        {
          role: 'user',
          content: `請解釋以下代碼：\n\n${code}`
        }
      ];
      return await this.chatCompletion(messages);
    } catch (error) {
      console.error('代碼解釋錯誤:', error);
      throw new Error('代碼解釋失敗');
    }
  }

  async suggestRefactoring(code: string) {
    try {
      const messages = [
        {
          role: 'system',
          content: '你是一個專業的代碼重構專家，請為以下代碼提供重構建議。'
        },
        {
          role: 'user',
          content: `請為以下代碼提供重構建議，重點關注：
1. 代碼可讀性
2. 性能優化
3. 最佳實踐
4. 設計模式應用

代碼：\n\n${code}`
        }
      ];
      return await this.chatCompletion(messages);
    } catch (error) {
      console.error('重構建議錯誤:', error);
      throw new Error('重構建議生成失敗');
    }
  }

  async completeCode(code: string) {
    try {
      return await this.generateCode(code);
    } catch (error) {
      console.error('代碼完成錯誤:', error);
      throw new Error('代碼完成失敗');
    }
  }
}
