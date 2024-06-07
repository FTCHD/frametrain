"use server";
import type { BuildFrameData, FrameActionPayload } from "@/lib/farcaster";
import type { Config, State } from "..";
import PageView from "../views/Start";

export default async function page(
  body: FrameActionPayload,
  config: Config,
  state: State,
  params: any
): Promise<BuildFrameData> {
  return {
    buttons: [
      {
        label: "Schedule Now",
      },
    ],
    component: PageView(config),
    functionName: "duration",
  };
}
