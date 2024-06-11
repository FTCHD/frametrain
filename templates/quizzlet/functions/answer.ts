"use server";
import type { BuildFrameData, FrameActionPayload } from "@/lib/farcaster";
import type { Config, State } from "..";
import PageView from "../views/Page";
import { loadGoogleFontAllVariants } from "@/sdk/fonts";

export default async function answer(
  body: FrameActionPayload,
  config: Config,
  state: State,
  _params: any
): Promise<BuildFrameData> {
  const student = body.untrustedData.fid.toString();
  const answer = body.untrustedData.buttonIndex;
  const pastAnswers = state.answers?.[student];

  const newState = state;

  console.log("/answer for quizzlet", student, answer, pastAnswers);

  const roboto = await loadGoogleFontAllVariants("Roboto");

  return {
    buttons: [
      {
        label: "←",
      },
    ],
    state: newState,
    fonts: roboto,
    aspectRatio: "1:1",
    component: PageView(config),
    functionName: "initial",
  };
}
