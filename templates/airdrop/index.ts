import type { BaseConfig, BaseStorage, BaseTemplate } from "@/lib/types";
import Inspector from "./Inspector";
import cover from "./cover.png";
import handlers from "./handlers";
import { BasicViewProps } from "@/sdk/views/BasicView";
import { GatingType } from "@/sdk/components/gating/types";

export type LinkButton = {
  action: "link";
  label: string;
  target: string;
};
export interface Config extends BaseConfig {
  tokenAddress: string;

  chain: keyof typeof airdropChains;
  walletAddress: string;
  generalAmount: number;
  whitelist: {
    address: string;
    amount: number;
  }[];
  blacklist: string[];
  cooldown: number;
  cover: BasicViewProps & {
    image?: string;
    customMessage: {
      text: string;
    };
    color: string;
  };
  creatorId: number | null;
  claimed: {
    text: string;
    links: Array<{
      label: string;
      target: string;
    }>;
  };

  buttons:
    | []
    | [LinkButton]
    | [LinkButton, LinkButton]
    | [LinkButton, LinkButton, LinkButton];
  gating: GatingType | undefined;
  enableGating: boolean | undefined;
}

const defaultConfig: Config = {
  tokenAddress: "",
  chain: "base",
  walletAddress: "",
  generalAmount: 0,
  whitelist: [],
  blacklist: [],
  cooldown: -1,
  creatorId: null,
  cover: {
    title: {
      text: "Airdropper",
    },
    subtitle: {
      text: "You're here to receive your free tokens",
    },
    customMessage: {
      text: "Custom Message",
    },
    color: "#ffffff",
    background: "#000000",
  },
  claimed: {
    text: "",
    links: [],
  },
  buttons: [],
  gating: {
    enabled: [],
    requirements: {
      maxFid: 0,
      minFid: 0,

      channels: [],
      exactFids: [],
    },
  },
  enableGating: false,
};

export const airdropChains = {
  ethereum: 1,
  optimism: 10,
  polygon: 137,
  base: 8453,
  arbitrum: 42161,
};

export interface Storage extends BaseStorage {
  users: Record<
    string,
    {
      claimed: boolean;
      lastUsage: number;
    }
  >;
}

const config: BaseTemplate = {
  name: "Airdrop",
  description: "Create an airdrop for farcasters users to claim in a frame",
  shortDescription:
    "Create an airdrop specifically for Farcaster users, allowing them to seamlessly claim tokens or assets within a dedicated frame interface.",
  octicon: "megaphone",
  creatorFid: "213144",
  creatorName: "Complexlity",
  cover,
  enabled: true,
  Inspector,
  handlers,
  initialConfig: defaultConfig,
  events: [],
};

export default config;
