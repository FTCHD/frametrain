"use server";
import type { BuildFrameData, FrameActionPayload } from "@/lib/farcaster";
import type { Config, State } from "..";
import PageView from "../views/Confirm";

export default async function page(
  body: FrameActionPayload,
  config: Config,
  state: State,
  params: any
): Promise<BuildFrameData> {
  const data = Object.assign(
    {},
    {
      ownerName: config.ownerName,
      ownerFid: config.ownerFid,
      ownerImg: config.ownerImg,

      desc: config.desc,

      duration: config.duration,
      date: config.date,
      slot: config.slot,
      durationSelected: config.durationSelected,
      dateSelected: config.dateSelected,
      slotSelected: config.slotSelected,
    }
  );
  return {
    buttons: [
      {
        label: "Dicard ❌",
      },
      {
        label: "Confirm ✅",
        action: "tx",
        target: "",
      },
    ],
    component: await PageView(data),
    functionName: "duration",
  };
}
