import fs from 'node:fs'
import type { Address } from 'viem'
import {
    http,
    type EncodeFunctionDataParameters,
    createWalletClient,
    encodeFunctionData,
    erc20Abi,
    publicActions,
    createPublicClient,
    isAddress,
} from 'viem'
import { parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains'
import type { airdropChains } from '..'
import { createGlideConfig, listPaymentOptions, currencies, chains } from "@paywithglide/glide-js";
import { channel } from 'node:diagnostics_channel'
import { get } from 'node:http'
import { list } from 'postcss'
type Configuration = {
    operatorPrivateKey: string
    chain: keyof typeof airdropChains
    paymentAmount: number
    receiverAddress: string
    tokenAddress: string
    walletAddress: string
}
const chainKeyToChain = {
    mainnet: mainnet,
    arbitrum: arbitrum,
    base: base,
    optimism: optimism,
    polygon: polygon,
}

 
export const glideConfig = createGlideConfig({
  projectId: process.env.GLIDE_PROJECT_ID!,
  chains: Object.values(chainKeyToChain),
});

export async function transferTokenToAddress(configuration: Configuration) {
    const {
        operatorPrivateKey,
        chain,
        tokenAddress,
        walletAddress,
        receiverAddress,
        paymentAmount,
    } = configuration

    const account = privateKeyToAccount(operatorPrivateKey as Address)
    
    const walletClient = createWalletClient({
        chain: chain == 'ethereum' ? chainKeyToChain['mainnet'] : chainKeyToChain[chain],
        transport: http(),
        account,
    }).extend(publicActions)
    const args = [walletAddress, receiverAddress, parseEther(`${paymentAmount}`)]
    const functionName = 'transferFrom'

    const data = encodeFunctionData({
        abi: erc20Abi,
        functionName,
        args,
    } as EncodeFunctionDataParameters)
    try {
        const txHash = await walletClient.sendTransaction({
            to: tokenAddress as Address,
            data,
        })
        console.log(txHash)
        return txHash
    } catch (error) {
        console.log('Something went wrong sending tokens to address')
        return null
    }
}
export async function getContractDetails(chain: keyof typeof chainKeyToChain, contractAddress: Address) {
    const client = createPublicClient({
      chain: chainKeyToChain[chain],
      transport: http(),
    });
    
      try {

        const [name, symbol] = await Promise.all([
          client.readContract({
            address: contractAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'name',
          }),
          client.readContract({
            address: contractAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'symbol',
          }),
        ]);
   
        return { name,  symbol }
      } catch (error) {
        console.error('Error fetching token details:', error);
        return null
      }
    }


// export async function getCrossChainTokenDetails(chain: keyof typeof chainKeyToChain, contractAddress: Address) {
//     if(!process.env.GLIDE_PROJECT_ID) {
//         throw new Error("GLIDE_PROJECT_ID is not set")
//     }
//     const paymentChainId = chainKeyToChain[chain].id
//     const paymentCurrency = getGlideCurrencyValue("optimism", "usdc")
//     console.log(paymentChainId)
//     console.log(paymentCurrency)

//     const paymentOptions = await listPaymentOptions(
//         glideConfig,
//         {

//         }
//     )
//     console.log("Done fetching payment options")
//     fs.writeFileSync("paymentOptions.json", JSON.stringify(paymentOptions, (k, v) => typeof v === "bigint" ? v.toString() : v, 2))
//     console.log("Payment options written to paymentOptions.json")

// }


// function getGlideCurrencyValue(
//     chainName: keyof typeof chainKeyToChain,
//     currencyId: string | Address
// ) {
//     const chainId = chainKeyToChain[chainName].id
//     if(isAddress(currencyId)){
//         return `eip155:${chainId}/erc20:${currencyId}`
//     }
//     try {
//         const currency = (currencies as any)[currencyId].on({id: chainId})
//         return currency
//     } catch (error) {
        
//     }
//     // "eip155:8453/erc20:0x0578d8a44db98b23bf096a382e016e29a5ce0ffe"
// }

// await getCrossChainTokenDetails("base", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
