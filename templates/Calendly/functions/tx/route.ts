import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ABI, CONTRACT_ADDRESS } from "../../utils/const";
// biome-ignore lint/style/useImportType: <explanation>
import { Abi, encodeFunctionData } from "viem";

export async function POST(req: NextRequest) {
  const calldata = encodeFunctionData({
    abi: ABI,
    functionName: "bookCall",
    args: [389273, 3892, 1, 0, 25, 6, 2024],
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
