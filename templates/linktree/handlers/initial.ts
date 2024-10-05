"use server";
import type {
  BuildFrameData,
  FrameButtonMetadata,
  FramePayloadValidated,
} from "@/lib/farcaster";
import type { Config } from "..";
import PageView from "../views/Page";
import CoverView from "../views/Cover";

export default async function page({
  body,
  config,
  storage,
  params,
}: {
  body: FramePayloadValidated;
  config: Config;
  storage: Storage;
  params: { nextPage?: number };
}): Promise<BuildFrameData> {
  let buttons: FrameButtonMetadata[];
  let nextPage = Number(params.nextPage) ?? 0;

  if (config.links.length <= 4) {
    buttons = config.links.map((link) => ({
      label: link.type[0].toUpperCase() + link.type.slice(1).toLowerCase(),
      action: "link",
      target: link.url,
    }));
    nextPage = 0;
  } else {
    const startIndex = nextPage * 3;
    const endIndex = Math.min(startIndex + 3, config.links.length);
    buttons = config.links.slice(startIndex, endIndex).map((link) => ({
      label: link.type[0].toUpperCase() + link.type.slice(1).toLowerCase(),
      action: "link",
      target: link.url,
    }));

    if (endIndex < config.links.length) {
      buttons.push({
        label: "Next",
      });
      nextPage++;
    } else {
      nextPage = 0; // Reset to the first page if we're on the last page
    }
  }

  return {
    buttons,
    aspectRatio: "1:1",
    component: CoverView(config),
    handler: "initial",
    ...(nextPage > 0 ? { params: { nextPage } } : {}),
  };
}
