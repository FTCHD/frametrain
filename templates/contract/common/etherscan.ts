"use server";

import type { Abi, FormatAbi } from "abitype";
import { formatAbi } from "abitype";
import { isAddress } from "viem";
import { chainExplorerByHostname } from "./constants";

type Address = `0x${string}`;

export type SerializableConfig = {
    abis: FormatAbi<Abi>[];
    address: Address;
    network: string;
    link: string;
    chainId: string;
};

export async function getContractData(etherscanLink: string) {
    const explorerUrl = new URL(etherscanLink);

    const chainExplorer = chainExplorerByHostname[explorerUrl.hostname];
    if (!chainExplorer) {
        throw new Error(
            `Block explorer (${explorerUrl.hostname}) is not supported.`,
        );
    }

    const name = chainExplorer.name;
    const chainId = `${chainExplorer.id}`;

    console.info(`Fetching contract data from ${etherscanLink}...`);

    const pathComponents = explorerUrl.pathname.slice(1).split("/");
    const contractAddress = pathComponents[1];

    if (
        pathComponents[0] !== "address" ||
        !(typeof contractAddress === "string") ||
        !contractAddress.startsWith("0x")
    ) {
        throw new Error(
            `✗ Invalid block explorer URL (${explorerUrl.href}). Expected path "/address/<contract-address>".`,
        );
    }

    const abiResult = await getContractAbi(contractAddress, chainId);
    const rawAbi = abiResult.abi;

    const abi = formatAbi(rawAbi);

    const abis: FormatAbi<Abi>[] = [abi];
    // If the contract is an EIP-1967 proxy, get the implementation contract ABIs.
    if (isAddress(abiResult.proxy)) {
        console.log("getContractData >> abiResult.proxy", abiResult.proxy);
        const implAbiResult = await getContractAbi(
            abiResult.proxy,
            chainId,
        );
        const implAbi = formatAbi(implAbiResult.abi);
        abis.push(implAbi);
    }

    // Build and return the partial ponder config.
    const config: SerializableConfig = {
        abis,
        address: contractAddress as Address,
        network: name,
        chainId,
        link: etherscanLink,
    };

    return config;
}

const fetchEtherscan = async (url: string) => {
    const maxRetries = 5;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
        try {
            const response = await fetch(url);
            const data = (await response.json()) as
                | {
                    status: "1";
                    message: "OK";
                    result: { ABI: string; Implementation: "" | Address }[];
                }
                | {
                    status: "0";
                    message: "NOTOK";
                    result: string;
                };

            if (data.status === "0") {
                throw new Error(data.result);
            }

            const result = {
                abi: data.result[0].ABI,
                proxy: data.result[0].Implementation,
            };
            return result;
        } catch (error) {
            retryCount++;
            if (retryCount > maxRetries) {
                throw new Error(
                    `Max retries reached: ${(error as Error).message}`,
                );
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
};

const getContractAbi = async (
    contractAddress: string,
    chainId: string,
) => {
    const url = new URL("https://api.etherscan.io/v2/api");
    url.searchParams.append("chainid", chainId);
    url.searchParams.append("module", "contract");
    url.searchParams.append("action", "getsourcecode");
    url.searchParams.append("address", contractAddress);
    url.searchParams.append("apikey", `${process.env.ETHERSCAN_API_KEY}`);

    let result: { abi: Abi; proxy: "" | Address };

    try {
        const data = await fetchEtherscan(url.toString());

        if (!data) {
            throw new Error(
                `Failed to fetch ABI for contract ${contractAddress}`,
            );
        }

        if (data.abi === "Contract source code not verified") {
            throw new Error(
                `Contract ${contractAddress} is unverified or has an empty ABI.`,
            );
        }
        const parsedAbi = JSON.parse(data.abi) as Abi;
        const abi = parsedAbi; //.filter((a) => a.type === 'function')
        result = { abi, proxy: data.proxy };
    } catch (e) {
        const error = e as Error;
        console.error(
            `Failed to fetch ABI for contract ${contractAddress}. Error: ${error.message}`,
            error,
        );
        throw new Error(`Failed to fetch ABI for contract ${contractAddress}`);
    }

    return result;
};
