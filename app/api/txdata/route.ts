import { ABI } from "../../../templates/Calendly/utils/const";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// biome-ignore lint/style/useImportType: <explanation>
import { Abi, encodeFunctionData } from "viem";
import type { TransactionTargetResponse } from "frames.js";
import { getNextSixDates } from "@/templates/Calendly/utils/date";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const searchParams = new URLSearchParams(req.url);
  const owner = searchParams.get("owner");
  const user = searchParams.get("userfid");
  const d = searchParams.get("d");
  const time = searchParams.get("t");
  const dates = getNextSixDates();
  const date = dates[Number.parseInt(d!)];

  const calldata = encodeFunctionData({
    abi: ABI,
    functionName: "bookCall",
    args: [owner, user, time, 0, date, 6, 2024],
  });

  return NextResponse.json({
    chainId: "eip155:84532", // OP Mainnet 10
    method: "eth_sendTransaction",
    params: {
      abi: ABI as Abi,
      to: "0x51d51C87e7f55547D202FCdBb5713bF9d4a5f6A4",
      data: calldata,
      value: "0",
    },
  });
}
