import type { BaseConfig, BaseStorage, BaseTemplate } from "@/lib/types";
import Inspector from "./Inspector";
import cover from "./cover.jpg";
import handlers from "./handlers";

export type LinkType =
  | "twitter"
  | "warpcast"
  | "website"
  | "blog"
  | "github"
  | "linkedin"
  | "instagram";

export interface Link {
  type: LinkType;
  url: string;
}

export interface Config extends BaseConfig {
  links: Link[];
  cover: {
    title: string;
    titleColor: string;
    backgroundColor: string;
    usernameColor: string;
  };
  userData: {
    userImageUrl: string;
    username: string;
  };
}

export interface Storage extends BaseStorage {}

export default {
  name: "LinkTree",
  description: "An easy way to share your links",
  shortDescription: "An easy way to share you links",
  octicon: "gear", // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
  creatorFid: "0",
  creatorName: "FrameTrain",
  cover,
  enabled: true,
  Inspector,
  handlers,
  initialConfig: {
    links: [],
    cover: {
      title: "My Links",
      titleColor: "#000",
      backgroundColor: "#fbbf24",
      usernameColor: "#15803d",
    },
    userData: {
      userImageUrl: "https://i.imgur.com/mt3nbeI.jpg",
      username: "complexlity",
    },
  },
  events: [],
} satisfies BaseTemplate;
