import { Router } from 'express';
import { 智能服務 } from '../服務/智能';

const 路由 = Router();
const 智能 = new 智能服務();

// 生成程式碼
路由.post('/生成', async (請求, 回應) => {
  try {
    const { 提示 } = 請求.body;
    if (!提示) {
      return 回應.status(400).json({ 錯誤: '缺少提示詞' });
    }

    const 程式碼 = await 智能.生成程式碼(提示);
    回應.json({ 程式碼 });
  } catch (錯誤) {
    console.error('程式碼生成錯誤:', 錯誤);
    回應.status(500).json({ 錯誤: '程式碼生成失敗' });
  }
});

// 程式碼審查
路由.post('/審查', async (請求, 回應) => {
  try {
    const { 程式碼 } = 請求.body;
    if (!程式碼) {
      return 回應.status(400).json({ 錯誤: '缺少程式碼' });
    }

    const 審查結果 = await 智能.審查程式碼(程式碼);
    回應.json({ 審查結果 });
  } catch (錯誤) {
    console.error('程式碼審查錯誤:', 錯誤);
    回應.status(500).json({ 錯誤: '程式碼審查失敗' });
  }
});

// 程式碼解釋
路由.post('/解釋', async (請求, 回應) => {
  try {
    const { 程式碼 } = 請求.body;
    if (!程式碼) {
      return 回應.status(400).json({ 錯誤: '缺少程式碼' });
    }

    const 解釋 = await 智能.解釋程式碼(程式碼);
    回應.json({ 解釋 });
  } catch (錯誤) {
    console.error('程式碼解釋錯誤:', 錯誤);
    回應.status(500).json({ 錯誤: '程式碼解釋失敗' });
  }
});

// 重構建議
路由.post('/重構', async (請求, 回應) => {
  try {
    const { 程式碼 } = 請求.body;
    if (!程式碼) {
      return 回應.status(400).json({ 錯誤: '缺少程式碼' });
    }

    const 建議 = await 智能.重構建議(程式碼);
    回應.json({ 建議 });
  } catch (錯誤) {
    console.error('重構建議錯誤:', 錯誤);
    回應.status(500).json({ 錯誤: '重構建議生成失敗' });
  }
});

// 程式碼完成
路由.post('/完成', async (請求, 回應) => {
  try {
    const { 程式碼 } = 請求.body;
    if (!程式碼) {
      return 回應.status(400).json({ 錯誤: '缺少程式碼' });
    }

    const 完成結果 = await 智能.完成程式碼(程式碼);
    回應.json({ 完成結果 });
  } catch (錯誤) {
    console.error('程式碼完成錯誤:', 錯誤);
    回應.status(500).json({ 錯誤: '程式碼完成失敗' });
  }
});

// 聊天完成
路由.post('/聊天', async (請求, 回應) => {
  try {
    const { 訊息列表 } = 請求.body;
    if (!訊息列表 || !Array.isArray(訊息列表)) {
      return 回應.status(400).json({ 錯誤: '缺少訊息或格式錯誤' });
    }

    const 回覆 = await 智能.聊天完成(訊息列表);
    回應.json({ 回覆 });
  } catch (錯誤) {
    console.error('聊天完成錯誤:', 錯誤);
    回應.status(500).json({ 錯誤: '聊天完成失敗' });
  }
});

export default 路由;
