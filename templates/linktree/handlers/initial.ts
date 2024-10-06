"use server";
import type {
  BuildFrameData,
  FrameButtonMetadata,
  FramePayloadValidated,
} from "@/lib/farcaster";
import type { Config } from "..";
import CoverView from "../views/Cover";
import { start } from "repl";

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
  let nextPage = isNaN(Number(params.nextPage)) ? 0 : Number(params.nextPage);

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

    buttons.push({
      label: "⏭️",
    });
    if (endIndex < config.links.length) {
      nextPage++;
    } else {
      nextPage = 0; // Reset to the first page if we're on the last page
    }
  }

  return {
    buttons,
    component: CoverView(config),
    handler: "initial",
    ...(nextPage > 0 ? { params: { nextPage } } : {}),
  };
}
