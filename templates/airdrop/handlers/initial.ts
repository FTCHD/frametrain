"use server";
import type { BuildFrameData, FrameButtonMetadata } from "@/lib/farcaster";
import { loadGoogleFontAllVariants } from "@/sdk/fonts";
import BasicView from "@/sdk/views/BasicView";
import type { Config, Storage } from "..";
import { Frame } from "frames.js";
import Cover from "../views/Cover";

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
  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  const roboto = await loadGoogleFontAllVariants("Roboto");
  const buttons: FrameButtonMetadata[] = config.buttons.map((button) => {
    let target = button.target;
    if (!isValidUrl(target)) {
      //never gonna give you up youtube link
      target = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
    let label = button.label;
    if (!label) {
      label = "Button " + (buttons.indexOf(button) + 1);
    }
    return {
      label,
      action: "link",
      target,
    };
  });

  return {
    buttons: [{ label: "Claim" }, ...buttons],
    fonts: roboto,
    component: Cover(config),
    handler: "claim",
  };
}
