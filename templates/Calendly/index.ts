import type { BaseConfig, BaseState, BaseTemplate } from "@/lib/types";
import Inspector from "./Inspector";
import cover from "./cover.jpeg";
import functions from "./functions";

export interface Config extends BaseConfig {
  ownerFid: number;
  desc: string;
  ownerName: string;
  ownerImg: string;
  duration: number;
  date: number;
  slot: number;
}

export interface State extends BaseState {}

export default {
  name: "CalCast",
  description: "Sheduling infra for Farcaster",
  creatorFid: "389273",
  creatorName: "leofrank",
  cover,
  enabled: true,
  Inspector,
  functions,
  initialConfig: {
    ownerFid: 0,
    desc: "Please Verify to create a frame",
    ownerName: "undefined",
    ownerImg: "undefined",
    duration: 15,
    date: 1,
    slot: 1,
  },
  requiresValidation: false,
} satisfies BaseTemplate;
