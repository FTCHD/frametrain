"use server";
import type { BuildFrameData } from "@/lib/farcaster";
import { loadGoogleFontAllVariants } from "@/sdk/fonts";
import BasicView from "@/sdk/views/BasicView";
import type { Config, Storage } from "..";

export default async function initial({
  body,
  config,
  storage,
  params,
}: {
  // GET requests don't have a body.
  body: undefined;
  config: Config;
  storage: Storage;
  params: any;
}): Promise<BuildFrameData> {
  const roboto = await loadGoogleFontAllVariants("Roboto");
  const cover = config.cover;
  const buttons = config.buttons;

  return {
    buttons: [{ label: "Claim" }, ...buttons],
    fonts: roboto,
    component: config.cover.image ? undefined : BasicView(cover),
    handler: "claim",
  };
}
