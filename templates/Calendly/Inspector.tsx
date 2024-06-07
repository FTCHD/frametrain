"use client";
import { Button } from "@/components/shadcn/Button";
import { Input } from "@/components/shadcn/Input";
import { useFrameConfig, useFrameId } from "@/sdk/hooks";
import { useEffect, useRef, useState } from "react";
import type { Config } from ".";
import { useSession } from "next-auth/react";

export default function Inspector() {
  const [verified, setVerified] = useState(false);
  const [config, updateConfig] = useFrameConfig<Config>();
  const sesh = useSession();
  console.log(sesh.data?.user);

  const displayLabelInputRef = useRef<HTMLInputElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (verified) {
      // updateConfig({
      //   ownerName: sesh.data?.user?.name,
      //   ownerFid: sesh.data?.user?.id,
      //   ownerImg: sesh.data?.user?.image,
      // });
    }
  }, [verified]);

  return (
    <div className="w-full h-full space-y-4">
      <p>{JSON.stringify(config)}</p>
      <h2 className="text-lg font-semibold">CalCast</h2>

      <h3 className="text-lg font-semibold">Shedule a call</h3>

      <p>
        {verified
          ? "You have been verified Enter the necessary Detail to create a frame for yourself"
          : "Verify First to Edit your Frame"}
      </p>
      {verified ? (
        <div className="flex flex-col gap-2 ">
          <Input
            className="text-lg"
            placeholder="Enter your fid Manually to verify"
            ref={displayLabelInputRef}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2 ">
          <Input
            className="text-lg"
            placeholder="Enter your fid Manually to verify"
            ref={displayLabelInputRef}
          />
          <Button
            onClick={() => {
              if (!displayLabelInputRef.current?.value) return;
              if (displayLabelInputRef.current.value === sesh.data?.user?.id) {
                updateConfig({
                  ownerName: sesh.data?.user?.name,
                  ownerFid: sesh.data?.user?.id,
                  ownerImg: sesh.data?.user?.image,
                });
                setVerified(true);
              }
            }}
            className="w-full bg-border hover:bg-secondary-border text-primary"
          >
            Verify
          </Button>
        </div>
      )}
    </div>
  );
}
