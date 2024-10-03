import type { BaseConfig, BaseStorage, BaseTemplate } from "@/lib/types";
import Inspector from "./Inspector";
import cover from "./cover.png";
import handlers from "./handlers";
import { BasicViewProps } from "@/sdk/views/BasicView";
import { GatingType } from "@/sdk/components/gating/types";

export type LinkButton = {
  type: "link";
  label: string;
  target: string;
};
export interface AirdropConfig extends BaseConfig {
  tokenAddress: string;
  walletAddress: string;
  generalAmount: number;
  whitelist: {
    address: string;
    amount?: number;
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

const defaultConfig: AirdropConfig = {
  tokenAddress: "",
  walletAddress: "",
  generalAmount: 0,
  whitelist: [],
  blacklist: [],
  cooldown: -1,
  cover: {
    title: {
      text: "My Contract",
    },
    subtitle: {
      text: "Use the arrow buttons to navigate through all contract functions.",
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
export interface Storage extends BaseStorage {}

const config: BaseTemplate = {
  name: "Airdrop",
  description: "This lets you airdrop",
  shortDescription: "It doesn't matter. It lets you airdrop that's all. ",
  octicon: "alert", // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
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
