"use server";
import type { BuildFrameData, FrameActionPayload } from "@/lib/farcaster";
import type { Config, State } from "..";
import PageView from "../views/Date";

export default async function page(
  body: FrameActionPayload,
  config: Config,
  state: State,
  params: any
): Promise<BuildFrameData> {
  console.log(config.ownerName);
  const buttonIndex = body.untrustedData.buttonIndex;
  console.log(body.untrustedData.url);

  switch (buttonIndex) {
    case 1: {
      config.duration = 0;
      console.log(config.duration);
      break;
    }
    case 2: {
      config.duration = 1;
      console.log(config.duration);
      break;
    }
  }
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
    }
  );
  return {
    buttons: [
      {
        label: "⬅️",
        action: "post",
        target: body.untrustedData.url + "?date=2",
      },
      {
        label: "➡️",
      },
    ],
    component: PageView(data),
    functionName: "date",
  };
}
