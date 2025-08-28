import { NextRequest, NextResponse } from 'next/server';

// 簡單的測試 API 路由
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'CVV Bot API 測試成功',
      timestamp: new Date().toISOString(),
      status: 'operational',
      version: '4.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'API 測試失敗',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 支持 POST 請求測試
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'CVV Bot POST 測試成功',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'POST 測試失敗',
        message: error instanceof Error ? error.message : 'Invalid JSON'
      },
      { status: 400 }
    );
  }
}
