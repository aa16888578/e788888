import { Router } from 'express';
import { ClaudeService } from '../services/claude';

const router = Router();
const claudeService = new ClaudeService();

// 生成代碼
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: '缺少提示詞' });
    }

    const code = await claudeService.generateCode(prompt);
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

    const review = await claudeService.reviewCode(code);
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

    const explanation = await claudeService.explainCode(code);
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

    const suggestions = await claudeService.suggestRefactoring(code);
    res.json({ suggestions });
  } catch (error) {
    console.error('重構建議錯誤:', error);
    res.status(500).json({ error: '重構建議生成失敗' });
  }
});

export default router;
