import type { BaseConfig, BaseState, BaseTemplate } from "@/lib/types";
import Inspector from "./Inspector";
import cover from "./cover.png";
import functions from "./functions";
import type { dimensionsForRatio } from "@/sdk/constants";

export interface Config extends BaseConfig {
  event?: {
    id: string;
    price: string;
    backgroundCover: string;
    hosts: string[];
    locationType: string;
    date: string;
    timezone: string;
    title: string;
  };
  backgroundColor?: string;
  textColor?: string;
  aspectRatio?: keyof typeof dimensionsForRatio;
}

export interface State extends BaseState {}

export default {
  name: "Lu.ma Events Preview",
  description: "Create a Lu.ma event preview Frame",
  creatorFid: "260812",
  creatorName: "Steve",
  cover,
  enabled: true,
  Inspector,
  functions,
  requiresValidation: false,
  initialConfig: {
    event: undefined,
    aspectRation: "1/1",
  },
} satisfies BaseTemplate;
