"use server";
import type { BuildFrameData, FrameActionPayload } from "@/lib/farcaster";
import type { Config, State } from "..";
import PageView from "../views/Date";
import PrevPage from "../views/Duration";
import { duration } from "dayjs";

export default async function page(
  body: FrameActionPayload,
  config: Config,
  state: State,
  params: any
): Promise<BuildFrameData> {
  console.log(config.ownerName);
  const buttonIndex = body.untrustedData.buttonIndex;
  console.log("button index : " + buttonIndex);
  console.log("Status of duration selected : " + config.durationSelected);

  const date = params?.date === undefined ? 0 : Number(params?.date);

  switch (buttonIndex) {
    case 1: {
      if (params?.date === undefined) {
        console.log(params?.date);
        config.durationSelected = true;
        config.duration = 0;
      } else {
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
              label: "15 min",
              action: "post",
            },
            {
              label: "30 min",
            },
          ],
          component: PrevPage(data),
          functionName: "date",
        };
      }
      break;
    }
    case 2: {
      config.durationSelected = true;
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
      date: date,
      slot: config.slot,
      durationSelected: config.durationSelected,
      dateSelected: config.dateSelected,
      slotSelected: config.slotSelected,
    }
  );
  console.log("duration : " + config.duration);
  console.log(config.durationSelected);
  return {
    buttons: [
      {
        label: "back",
      },
      {
        label: "⬅️",
      },
      {
        label: "➡️",
      },
      {
        label: "proceed",
      },
    ],
    component: PageView(data),
    functionName: "date",
    params: {
      date: date,
    },
  };
}
