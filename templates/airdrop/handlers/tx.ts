"use server";
import type { BuildFrameData, FramePayloadValidated } from "@/lib/farcaster";
import { FrameError } from "@/sdk/error";
import { getViem } from "@/sdk/viem";
import {
  Abi,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  erc20Abi,
  getAbiItem,
  GetAbiItemParameters,
  maxInt256
} from "viem";
import { airdropChains, type Config, type Storage } from "..";

export default async function txData({
  config,
  params,
  storage,
  body,
}: {
  body: FramePayloadValidated;
  config: Config;
  storage: Storage;
  params:
    | {
        buyAmount: string;
        ts: string;
      }
    | undefined;
}): Promise<BuildFrameData> {
  const userFid = body.interactor.fid;
  const creatorFid = config.creatorId;
  const chain = config.chain;

  if (userFid !== creatorFid) {
    throw new FrameError("You are not approved to use this function");
  }

  const FRAME_TRAIN_OPERATOR_ADDRESS = `0x.....` as `0x${string}`;

  const chainId = airdropChains[config.chain];

  const publicClient = getViem(chain === "ethereum" ? "mainnet" : chain);
  const args = [FRAME_TRAIN_OPERATOR_ADDRESS, maxInt256];
  const functionName = "approve";
  const abiItem = getAbiItem({
    abi: erc20Abi,
    name: functionName,
    args,
  } as GetAbiItemParameters);
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName,
    args,
  } as EncodeFunctionDataParameters);

  const abiErrorItems = (erc20Abi as Abi).filter(
    (item) => item.type === "error"
  );

  return {
    buttons: [],
    transaction: {
      chainId: `eip155:${chainId}`,
      method: "eth_sendTransaction",
      params: {
        to: config.tokenAddress as `0x${string}`,
        value: "0",
        data: data,
        abi: [abiItem!, ...abiErrorItems],
      },
    },
  };
}
