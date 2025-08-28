import { Router } from 'express';
import { CodestralService } from '../services/codestral';

const router = Router();

// 動態創建 Codestral 服務實例的函數
function getCodestralService(): CodestralService {
  // 這裡將來可以從資料庫或配置系統獲取 API 金鑰
  // 目前先使用環境變數或預設配置
  return new CodestralService();
}

// 配置狀態檢查端點
router.get('/status', (req, res) => {
  try {
    const service = getCodestralService();
    res.json({
      configured: service.isConfigured(),
      message: service.isConfigured() 
        ? 'Codestral 服務已配置' 
        : 'Codestral 服務未配置，請在後台管理中設置 API 金鑰'
    });
  } catch (error) {
    res.status(500).json({ error: '無法檢查 Codestral 服務狀態' });
  }
});

// 代碼生成
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: '缺少提示詞' });
    }

    const code = await codestralService.generateCode(prompt);
    res.json({ code });
  } catch (error) {
    console.error('代碼生成錯誤:', error);
    res.status(500).json({ error: '代碼生成失敗' });
  }
});

// 代碼審查
router.post('/review', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: '缺少代碼' });
    }

    const review = await codestralService.reviewCode(code);
    res.json({ review });
  } catch (error) {
    console.error('代碼審查錯誤:', error);
    res.status(500).json({ error: '代碼審查失敗' });
  }
});

// 代碼解釋
router.post('/explain', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: '缺少代碼' });
    }

    const explanation = await codestralService.explainCode(code);
    res.json({ explanation });
  } catch (error) {
    console.error('代碼解釋錯誤:', error);
    res.status(500).json({ error: '代碼解釋失敗' });
  }
});

// 重構建議
router.post('/refactor', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: '缺少代碼' });
    }

    const suggestions = await codestralService.suggestRefactoring(code);
    res.json({ suggestions });
  } catch (error) {
    console.error('重構建議錯誤:', error);
    res.status(500).json({ error: '重構建議生成失敗' });
  }
});

// 代碼完成
router.post('/complete', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: '缺少代碼' });
    }

    const completion = await codestralService.completeCode(code);
    res.json({ completion });
  } catch (error) {
    console.error('代碼完成錯誤:', error);
    res.status(500).json({ error: '代碼完成失敗' });
  }
});

// 聊天完成
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '缺少消息或格式錯誤' });
    }

    const response = await codestralService.chatCompletion(messages);
    res.json({ response });
  } catch (error) {
    console.error('聊天完成錯誤:', error);
    res.status(500).json({ error: '聊天完成失敗' });
  }
});

export default router;
