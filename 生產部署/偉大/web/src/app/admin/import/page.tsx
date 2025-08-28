'use client';

import { useState, useRef } from 'react';
import { cvvService } from '@/lib/cvvService';
import { 
  CVVImportRequest, 
  CVVImportResult,
  CVVCard
} from '@/types/cvv';

export default function CVVImportPage() {
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json' | 'txt'>('csv');
  const [batchName, setBatchName] = useState('');
  const [validateOnly, setValidateOnly] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CVVImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      
      // 自動檢測格式
      if (file.name.endsWith('.json')) {
        setImportFormat('json');
      } else if (file.name.endsWith('.csv')) {
        setImportFormat('csv');
      } else {
        setImportFormat('txt');
      }
      
      // 設置批次名稱
      if (!batchName) {
        const name = file.name.replace(/\.[^/.]+$/, '');
        setBatchName(`導入_${name}_${new Date().toISOString().slice(0, 10)}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      alert('請輸入要導入的數據');
      return;
    }

    try {
      setImporting(true);
      setResult(null);

      const request: CVVImportRequest = {
        source: 'manual',
        format: importFormat,
        data: importData,
        batchName: batchName || `批次_${Date.now()}`,
        validateOnly,
        autoProcess: !validateOnly
      };

      const importResult = await cvvService.importCards(request);
      setResult(importResult);
      
      if (!validateOnly && importResult.successCount > 0) {
        alert(`成功導入 ${importResult.successCount} 張卡片！`);
      }
    } catch (error) {
      console.error('導入失敗:', error);
      alert('導入失敗: ' + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const generateSampleData = () => {
    const sampleCSV = `cardNumber,expiryMonth,expiryYear,cvvCode,cardType,bankName,country,countryName,price,balanceRange,successRate,category
4532123456789012,12,2025,123,visa,Chase Bank,US,美國,5.50,$100-$500,85%,premium
5555123456789012,06,2026,456,mastercard,Bank of America,US,美國,6.00,$200-$800,90%,hot
4111123456789012,03,2025,789,visa,Citibank,CA,加拿大,4.50,$50-$300,75%,basic`;
    
    const sampleJSON = `[
  {
    "cardNumber": "4532123456789012",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvvCode": "123",
    "cardType": "visa",
    "bankName": "Chase Bank",
    "country": "US",
    "countryName": "美國",
    "price": 5.50,
    "balanceRange": "$100-$500",
    "successRate": "85%",
    "category": "premium"
  }
]`;

    const sampleTXT = `4532123456789012|12|2025|123|visa|Chase Bank|US|美國|5.50|$100-$500|85%|premium
5555123456789012|06|2026|456|mastercard|Bank of America|US|美國|6.00|$200-$800|90%|hot`;

    const samples = {
      csv: sampleCSV,
      json: sampleJSON,
      txt: sampleTXT
    };

    setImportData(samples[importFormat]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🤖 AI 智能入庫</h1>
          <p className="text-gray-600 mt-2">批量導入 CVV 卡片數據，支持 CSV、JSON、TXT 格式</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 導入配置 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">導入設置</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    數據格式
                  </label>
                  <select
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value as 'csv' | 'json' | 'txt')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="csv">CSV 格式</option>
                    <option value="json">JSON 格式</option>
                    <option value="txt">TXT 格式 (分隔符: |)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    批次名稱
                  </label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="輸入批次名稱"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={validateOnly}
                    onChange={(e) => setValidateOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    僅驗證數據（不實際導入）
                  </span>
                </label>
              </div>

              {/* 文件拖拽區域 */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  拖拽文件到此處或點擊選擇
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  支持 .csv, .json, .txt 文件
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  選擇文件
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* 數據輸入區域 */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    數據內容
                  </label>
                  <button
                    onClick={generateSampleData}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    生成示例數據
                  </button>
                </div>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={`請輸入 ${importFormat.toUpperCase()} 格式的數據...`}
                  rows={12}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* 導入按鈕 */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setImportData('');
                    setBatchName('');
                    setResult(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  清除
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || !importData.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {importing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {validateOnly ? '驗證數據' : '開始導入'}
                </button>
              </div>
            </div>
          </div>

          {/* 側邊欄 - 格式說明 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">📋 數據格式說明</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">必填字段：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• cardNumber (卡號)</li>
                    <li>• expiryMonth (有效期月)</li>
                    <li>• expiryYear (有效期年)</li>
                    <li>• cvvCode (CVV碼)</li>
                    <li>• cardType (卡片類型)</li>
                    <li>• country (國家代碼)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">可選字段：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• bankName (銀行名稱)</li>
                    <li>• price (價格)</li>
                    <li>• balanceRange (餘額範圍)</li>
                    <li>• successRate (成功率)</li>
                    <li>• category (分類)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">卡片類型：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• visa, mastercard</li>
                    <li>• amex, discover</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">分類：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• basic (基礎版)</li>
                    <li>• premium (高級版)</li>
                    <li>• hot (熱門版)</li>
                    <li>• vip (VIP版)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI 功能說明 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                AI 智能功能
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  自動數據驗證
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  重複數據檢測
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  智能格式轉換
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  批量錯誤修正
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  自動分類標記
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 導入結果 */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">📊 導入結果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{result.totalProcessed}</div>
                <div className="text-sm text-blue-600">總處理數量</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
                <div className="text-sm text-green-600">成功數量</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
                <div className="text-sm text-red-600">錯誤數量</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{result.duplicateCount}</div>
                <div className="text-sm text-yellow-600">重複數量</div>
              </div>
            </div>

            {/* 錯誤詳情 */}
            {result.errors.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-red-600 mb-3">❌ 錯誤詳情</h3>
                <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-2">
                      第 {error.line} 行，字段 "{error.field}"：{error.error}
                      <span className="text-red-500 ml-2">值: {error.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 成功導入的卡片預覽 */}
            {result.validCards.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-green-600 mb-3">✅ 成功導入預覽</h3>
                <div className="bg-green-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {result.validCards.slice(0, 5).map((card, index) => (
                    <div key={index} className="text-sm text-green-700 mb-2 flex justify-between">
                      <span>{card.cardNumber} • {card.cardType} • {card.country}</span>
                      <span>${card.price}</span>
                    </div>
                  ))}
                  {result.validCards.length > 5 && (
                    <div className="text-sm text-green-600 text-center mt-2">
                      ... 還有 {result.validCards.length - 5} 張卡片
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
