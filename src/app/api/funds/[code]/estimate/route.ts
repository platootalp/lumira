/**
 * API: 获取基金实时估值
 * 
 * Agent: backend-engineer
 * Skills: fund-data-fetch
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, FundEstimate } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
): Promise<NextResponse<ApiResponse<FundEstimate>>> {
  try {
    const { code } = params;

    // TODO: 集成天天基金估值 API
    // https://fundmobapi.eastmoney.com/FundMApi/FundBase.ashx?FCODE={code}

    // 返回模拟数据
    const mockEstimate: FundEstimate = {
      fundId: code,
      fundName: "银河创新成长混合A",
      estimateNav: 5.2891,
      estimateTime: "2024-02-20 15:00:00",
      estimateChange: 0.0546,
      estimateChangePercent: 1.04,
      lastNav: 5.2345,
      lastNavDate: "2024-02-19",
      source: "eastmoney",
      cached: false
    };

    return NextResponse.json({
      success: true,
      data: mockEstimate,
      meta: { 
        cached: false, 
        timestamp: new Date().toISOString(),
        source: "eastmoney"
      }
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
