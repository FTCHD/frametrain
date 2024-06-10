import type { BaseConfig, BaseState, BaseTemplate } from "@/lib/types";
import Inspector from "./Inspector";
import cover from "./cover.jpeg";
import functions from "./functions";

export interface Config extends BaseConfig {
  text: string;
  options: {
    buttonLabel: string;
    displayLabel: string;
    index: number;
  }[];
  qna: {
    question: string;
    answer: number;
    choices: number;
    isNumeric: boolean;
    index: number;
  }[];
  background?: string;
  textColor?: string;
  barColor?: string;
}

export interface State extends BaseState {
  // with questions and answers form being in the following format
  // qna: [ { question: string, answer: string, choices: string[] } ]
  // answers should be in the following format
  // answers: { [fid: string]: [{ questionIndex: number, answerIndex: number }] }
  answers: {
    [fid: string]: {
      questionIndex: number;
      answerIndex: number;
    }[];
  };
}

export default {
  name: "Quizzlet Template",
  description:
    "Create your own Multiple-Choice Questions Quiz as a Farcaster Frame.",
  creatorFid: "260812",
  creatorName: "Steve",
  enabled: true,
  Inspector,
  functions,
  cover,
  initialConfig: {
    text: "Default Text",
  },
  requiresValidation: true,
} satisfies BaseTemplate;
