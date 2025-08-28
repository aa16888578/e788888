import axios from 'axios';

export class 智能服務 {
  private 金鑰: string;
  private 基礎網址: string;
  
  constructor() {
    this.金鑰 = 'BM9Qm7J0N1wmOIFG6mfo5Xr2lOamGWrz';
    this.基礎網址 = 'https://codestral.mistral.ai/v1';
  }

  private async 發送請求(端點: string, 資料: any) {
    try {
      const 回應 = await axios.post(`${this.基礎網址}${端點}`, 資料, {
        headers: {
          'Authorization': `Bearer ${this.金鑰}`,
          'Content-Type': 'application/json'
        }
      });
      return 回應.data;
    } catch (錯誤) {
      console.error('智能API錯誤:', 錯誤);
      throw 錯誤;
    }
  }

  async 生成程式碼(提示: string) {
    try {
      const 回應 = await this.發送請求('/fim/completions', {
        prompt: 提示,
        max_tokens: 1000,
        temperature: 0.7,
        stop: ['```']
      });
      return 回應.choices[0].text;
    } catch (錯誤) {
      console.error('程式碼生成錯誤:', 錯誤);
      throw new Error('程式碼生成失敗');
    }
  }

  async 聊天完成(訊息列表: Array<{角色: string; 內容: string}>) {
    try {
      const 回應 = await this.發送請求('/chat/completions', {
        messages: 訊息列表.map(訊息 => ({
          role: 訊息.角色,
          content: 訊息.內容
        })),
        max_tokens: 1000,
        temperature: 0.7
      });
      return 回應.choices[0].message.content;
    } catch (錯誤) {
      console.error('聊天完成錯誤:', 錯誤);
      throw new Error('聊天完成失敗');
    }
  }

  async 審查程式碼(程式碼: string) {
    try {
      const 訊息列表 = [
        {
          角色: 'system',
          內容: '你是一個專業的程式碼審查者，請審查以下程式碼並提供改進建議。'
        },
        {
          角色: 'user',
          內容: `請審查以下程式碼：\n\n${程式碼}`
        }
      ];
      return await this.聊天完成(訊息列表);
    } catch (錯誤) {
      console.error('程式碼審查錯誤:', 錯誤);
      throw new Error('程式碼審查失敗');
    }
  }

  async 解釋程式碼(程式碼: string) {
    try {
      const 訊息列表 = [
        {
          角色: 'system',
          內容: '你是一個專業的程式碼解釋者，請解釋以下程式碼的功能和邏輯。'
        },
        {
          角色: 'user',
          內容: `請解釋以下程式碼：\n\n${程式碼}`
        }
      ];
      return await this.聊天完成(訊息列表);
    } catch (錯誤) {
      console.error('程式碼解釋錯誤:', 錯誤);
      throw new Error('程式碼解釋失敗');
    }
  }

  async 重構建議(程式碼: string) {
    try {
      const 訊息列表 = [
        {
          角色: 'system',
          內容: '你是一個專業的程式碼重構專家，請為以下程式碼提供重構建議。'
        },
        {
          角色: 'user',
          內容: `請為以下程式碼提供重構建議，重點關注：
1. 程式碼可讀性
2. 效能優化
3. 最佳實踐
4. 設計模式應用

程式碼：\n\n${程式碼}`
        }
      ];
      return await this.聊天完成(訊息列表);
    } catch (錯誤) {
      console.error('重構建議錯誤:', 錯誤);
      throw new Error('重構建議生成失敗');
    }
  }

  async 完成程式碼(程式碼: string) {
    try {
      return await this.生成程式碼(程式碼);
    } catch (錯誤) {
      console.error('程式碼完成錯誤:', 錯誤);
      throw new Error('程式碼完成失敗');
    }
  }
}
