"use server";
import type { BuildFrameData, FramePayloadValidated } from "@/lib/farcaster";
import { runGatingChecks } from "@/lib/gating";
import { FrameError } from "@/sdk/error";
import BasicView from "@/sdk/views/BasicView";
import { type Config } from "..";
import { transferTokenToAddress } from "../utils/transerToAddress";
import ClaimedView from "../views/Claimed";

export default async function page({
  body,
  config,
  storage,
  params,
}: {
  body: FramePayloadValidated;
  config: Config;
  storage: Storage;
  params: any;
}): Promise<BuildFrameData> {
  const {
    blacklist,
    whitelist,
    creatorId: creatorFid,
    generalAmount,
    enableGating,
    cooldown,
    chain,
    walletAddress,
    tokenAddress,
  } = config;
  const { fid: viewerFid, verified_addresses: viewerAddresses } =
    body.interactor;

  let paymentAmount = generalAmount;
  const viewerFromStorage = storage[viewerFid];

  if (enableGating) {
    await runGatingChecks(body, config.gating);
  }

  //Check if user has already claimed
  if (viewerFromStorage?.claimed) {
    throw new FrameError("You've already claimed");
  }

  if (cooldown != -1) {
    const viewerFromStorage = storage.users[viewerFid];
    if (viewerFromStorage?.lastUsage + cooldown * 1000 > Date.now()) {
      throw new FrameError("You're in cooldown period");
    }
  }

  if (viewerFid === creatorFid) {
    //User is creator so return the approve screen
    return {
      buttons: [
        {
          label: "Approve",
          action: "tx",
          handler: "tx",
        },
      ],
      component: BasicView({
        ...config.cover,
        title: { text: "Approve" },
        subtitle: {
          text: "Approve our operator to spend tokens on your behalf",
        },
      }),
      handler: "approve",
    };
  }

  //Get blacklist, whitelist or claimed
  for (let i = 0; i < viewerAddresses.eth_addresses.length; i++) {
    const address = viewerAddresses.eth_addresses[i];
    //Check blacklist
    if (blacklist.includes(address)) {
      throw new FrameError("You're not eligible to claim");
    }
    //Check whitelist
    const userInWhiteList = whitelist.find((item) => item.address === address);
    if (!!userInWhiteList) {
      paymentAmount = userInWhiteList.amount ?? generalAmount;
      //No need for a user to be in both black and whitelist so just break
      break;
    }
  }

  //Send airdrop amount to user
  const FRAME_TRAIN_OPERATOR_PRIVATE_KEY = `0x.....`;
  const configuration = {
    operatorPrivateKey: FRAME_TRAIN_OPERATOR_PRIVATE_KEY,
    chain: chain,
    paymentAmount,
    receiverAddress:
      viewerAddresses.eth_addresses[0] ?? body.interactor.custody_address,
    tokenAddress,
    walletAddress,
  };
  transferTokenToAddress(configuration);

  //Update storage
  const newStorage = {
    ...storage,
    users: {
      ...storage.users,
      [viewerFid]: {
        claimed: true,
        lastUsage: Date.now(),
      },
    },
  };

  return {
    buttons: [
      {
        label: "Home 🏡",
      },
    ],
    storage: newStorage,
    component: ClaimedView(),
    handler: "initial",
  };
}
