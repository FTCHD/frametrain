"use server";
import type { BuildFrameData, FrameActionPayload } from "@/lib/farcaster";
import type { Config, State } from "..";
import PageView from "../views/Slot";
import PrevPage from "../views/Date";

export default async function page(
  body: FrameActionPayload,
  config: Config,
  state: State,
  params: any
): Promise<BuildFrameData> {
  console.log(config.ownerName);
  console.log(params);
  console.log(params.duration + " slot ");
  const buttonIndex = body.untrustedData.buttonIndex;
  console.log(buttonIndex);
  // biome-ignore lint/style/useConst: <explanation>
  let slot = params?.slot === undefined ? 0 : Number(params?.slot);
  console.log(slot);

  switch (buttonIndex) {
    case 1: {
      const data = Object.assign(
        {},
        {
          ownerName: config.ownerName,
          ownerFid: config.ownerFid,
          ownerImg: config.ownerImg,

          desc: config.desc,

          duration: params.duration,
          date: config.date,
          slot: slot,
          durationSelected: config.durationSelected,
          dateSelected: config.dateSelected,
          slotSelected: config.slotSelected,
        }
      );
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
        component: PrevPage(data),
        functionName: "date",
        params: {
          date: config.date,
          duration: params.duration,
        },
      };
    }
    case 2: {
      if (Number(params.slot) > 0) {
        slot = Number(params.slot) - 1;
      } else {
        slot = 0;
      }
      const data = Object.assign(
        {},
        {
          ownerName: config.ownerName,
          ownerFid: config.ownerFid,
          ownerImg: config.ownerImg,

          desc: config.desc,

          duration: params.duration,
          date: config.date,
          slot: slot,
          durationSelected: config.durationSelected,
          dateSelected: config.dateSelected,
          slotSelected: config.slotSelected,
        }
      );
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
        component: await PageView(data),
        functionName: "slot",
        params: {
          date: params.date,
          duration: params.duration,
          slot: slot,
        },
      };
    }

    case 3: {
      if (Number(params.slot) < 14) {
        slot = Number(params.slot) + 1;
      } else {
        slot = 0;
      }
      const data = Object.assign(
        {},
        {
          ownerName: config.ownerName,
          ownerFid: config.ownerFid,
          ownerImg: config.ownerImg,

          desc: config.desc,

          duration: params.duration,
          date: config.date,
          slot: slot,
          durationSelected: config.durationSelected,
          dateSelected: config.dateSelected,
          slotSelected: config.slotSelected,
        }
      );
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
        component: await PageView(data),
        functionName: "slot",
        params: {
          date: params.date,
          duration: params.duration,
          slot: slot,
        },
      };
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
      slot: slot,
      durationSelected: config.durationSelected,
      dateSelected: config.dateSelected,
      slotSelected: config.slotSelected,
    }
  );
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
    component: await PageView(data),
    functionName: "initial",
    params: {
      date: params.date,
      duration: params.duration,
      slot: slot,
    },
  };
}
