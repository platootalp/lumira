/**
 * API: 搜索基金
 * 
 * Agent: backend-engineer
 * 从天天基金搜索基金信息
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, Fund } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Fund[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({
        success: false,
        error: { code: "INVALID_PARAMS", message: "缺少搜索关键词" }
      }, { status: 400 });
    }

    // TODO: 集成天天基金搜索 API
    // 返回模拟数据
    const mockFunds: Fund[] = [
      {
        id: "519674",
        name: "银河创新成长混合A",
        type: "MIX",
        riskLevel: "MEDIUM_HIGH",
        company: "银河基金",
        managerId: "001",
        nav: 5.2345,
        accumNav: 5.2345,
        navDate: "2024-02-20",
        feeRate: { buy: 0.015, sell: 0.005, management: 0.015 },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockFunds,
      meta: { cached: false, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { 
        code: "INTERNAL_ERROR", 
        message: (error as Error).message 
      }
    }, { status: 500 });
  }
}
