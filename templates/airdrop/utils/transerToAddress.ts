import { Address } from "viem";
import {
  createWalletClient,
  http,
  publicActions,
  encodeFunctionData,
  erc20Abi,
  EncodeFunctionDataParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, arbitrum, base, optimism, polygon } from "viem/chains";
import { airdropChains } from "..";
import { parseEther } from "viem";
type Configuration = {
  operatorPrivateKey: string;
  chain: keyof typeof airdropChains;
  paymentAmount: number;
  receiverAddress: string;
  tokenAddress: string;
  walletAddress: string;
};

export async function transferTokenToAddress(configuration: Configuration) {
  const {
    operatorPrivateKey,
    chain,
    tokenAddress,
    walletAddress,
    receiverAddress,
    paymentAmount,
  } = configuration;

  const account = privateKeyToAccount(operatorPrivateKey as Address);
  const chainKeyToChain = {
    mainnet: mainnet,
    arbitrum: arbitrum,
    base: base,
    optimism: optimism,
    polygon: polygon,
  };
  const walletClient = createWalletClient({
    chain:
      chain == "ethereum" ? chainKeyToChain["mainnet"] : chainKeyToChain[chain],
    transport: http(),
    account,
  }).extend(publicActions);
  const args = [walletAddress, receiverAddress, parseEther(`${paymentAmount}`)];
  const functionName = "transferFrom";

  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName,
    args,
  } as EncodeFunctionDataParameters);
  try {
    const txHash = await walletClient.sendTransaction({
      to: tokenAddress as Address,
      data,
    });
    console.log(txHash);
    return txHash;
  } catch (error) {
    console.log("Something went wrong sending tokens to address");
    return null;
  }
}
