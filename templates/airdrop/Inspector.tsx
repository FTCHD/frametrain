"use client";
import {
  BasicViewInspector,
  Button,
  GatingInspector,
  Input,
  Label,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from "@/sdk/components";
import { useFarcasterId, useFrameConfig, useUploadImage } from "@/sdk/hooks";
import { Configuration } from "@/sdk/inspector";
import { useEffect, useRef, useState } from "react";
import type { Config, LinkButton } from ".";
import { isAddress } from "viem";
import toast from "react-hot-toast";
import { airdropChains } from ".";
import { X } from "lucide-react";

interface WhiteList {
  address: string;
  amount: number;
}
export default function Inspector() {
  const userFid = useFarcasterId();
  const [config, updateConfig] = useFrameConfig<Config>();
  useEffect(() => {
    if (!userFid || config) return;
    updateConfig({ creatorId: userFid });
  }, [userFid, config]);
  return (
    <Configuration.Root>
      <Configuration.Section title="General">
        <GeneralSection />
      </Configuration.Section>
      <Configuration.Section title="Whitelist">
        <WhiteListSection />
      </Configuration.Section>
      <Configuration.Section title="Blacklist">
        <BlackListSection />
      </Configuration.Section>
      <Configuration.Section
        title="Cover"
        description="Configure what shows up on the cover screen of your Frame."
      >
        <CoverSection />
      </Configuration.Section>
      <Configuration.Section title="Buttons">
        <ButtonsSection />
      </Configuration.Section>
      <Configuration.Section title="Gating">
        <GatingSection />
      </Configuration.Section>
    </Configuration.Root>
  );
}

function GatingSection() {
  const fid = useFarcasterId();
  const [config, updateConfig] = useFrameConfig<Config>();
  const enabledGating = config.enableGating ?? false;
  return (
    <div>
      <div className="flex flex-row items-center justify-between gap-2 ">
        <Label className="font-md" htmlFor="gating">
          Enable Gating?
        </Label>
        <Switch
          id="gating"
          checked={enabledGating}
          onCheckedChange={(enableGating) => {
            updateConfig({ enableGating });
          }}
        />
      </div>

      {enabledGating && (
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-lg font-semibold">Poll Gating options</h2>
          <GatingInspector
            fid={fid}
            config={config.gating}
            onUpdate={(option) => {
              updateConfig({
                gating: {
                  ...config.gating,
                  ...option,
                },
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
function CoverSection() {
  const [config, updateConfig] = useFrameConfig<Config>();
  const [coverType, setCoverType] = useState<"text" | "image">(
    config?.cover && "image" in config.cover ? "image" : "text"
  );

  const uploadImage = useUploadImage();

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-lg font-semibold">Cover Type</h2>
        <RadioGroup.Root
          defaultValue={coverType}
          className="flex flex-row"
          onValueChange={(val) => {
            const value = val as "image" | "text";
            setCoverType(value);
            if (val === "text" && config.cover.image) {
              updateConfig({
                cover: {
                  ...config.cover,
                  image: null,
                },
              });
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroup.Item value="text" id="text" />
            <Label htmlFor="text">Text</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroup.Item value="image" id="image" />
            <Label htmlFor="image">Image</Label>
          </div>
        </RadioGroup.Root>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {coverType === "image" ? (
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="cover-image"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              {config.cover.image ? "Update" : "Upload"} Cover Image
            </label>
            <Input
              accept="image/png, image/jpeg, image/gif, image/webp"
              type="file"
              id="cover-image"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const reader = new FileReader();
                  reader.readAsDataURL(e.target.files[0]);

                  const base64String = (await new Promise((resolve) => {
                    reader.onload = () => {
                      const base64String = (reader.result as string).split(
                        ","
                      )[1];
                      resolve(base64String);
                    };
                  })) as string;

                  const contentType = e.target.files[0].type as
                    | "image/png"
                    | "image/jpeg"
                    | "image/gif"
                    | "image/webp";

                  const { filePath } = await uploadImage({
                    base64String,
                    contentType,
                  });

                  if (filePath) {
                    const image = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`;
                    updateConfig({
                      cover: {
                        ...config.cover,
                        image,
                      },
                    });
                  }
                }
              }}
            />
            {config.cover.image ? (
              <Button
                variant="destructive"
                onClick={() => {
                  updateConfig({
                    cover: {
                      ...config.cover,
                      image: null,
                    },
                  });
                }}
                className="w-full"
              >
                Remove
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <BasicViewInspector
              name="Cover"
              title={config.cover.title}
              subtitle={config.cover.subtitle}
              bottomMessage={config.cover.bottomMessage}
              background={config.cover.background}
              onUpdate={(cover) => {
                updateConfig({
                  cover,
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function BlackListSection() {
  const [config, updateConfig] = useFrameConfig<Config>();
  const [newAddress, setNewAddress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addBlacklistItem = () => {
    if (!isAddress(newAddress)) {
      toast("Invalid address");
      return;
    }
    if (config.blacklist.includes(newAddress)) {
      toast("Address already in blacklist");
      return;
    }
    updateConfig({
      blacklist: [...config.blacklist, newAddress],
    });
    setNewAddress("");
  };

  const removeBlacklistItem = (address: string) => {
    const newBlacklist = config.blacklist.filter((item) => item !== address);
    updateConfig({ blacklist: newBlacklist });
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split("\n");
      const newAddresses = lines
        .map((line) => line.trim())
        .filter(
          (address) => isAddress(address) && !config.blacklist.includes(address)
        );

      if (newAddresses.length > 0) {
        updateConfig({
          blacklist: [...config.blacklist, ...newAddresses],
        });
        toast(`Added ${newAddresses.length} new addresses to blacklist`);
      } else {
        toast("No new valid addresses found in CSV");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="max-h-60 overflow-y-auto space-y-2">
        {config.blacklist.map((address, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-secondary p-2 rounded"
          >
            <span className="text-sm font-mono">{address}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeBlacklistItem(address)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-col">
        <Label htmlFor="new-blacklist-address">New Blacklist Address</Label>
        <div className="flex-grow flex w-full gap-2 items-center">
          <Input
            id="new-blacklist-address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter address"
          />
          <Button onClick={addBlacklistItem} className="self-center">
            Add
          </Button>
        </div>
      </div>
      <div className="text-center mx-auto w-full">OR</div>
      <div>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          Upload CSV
        </Button>
      </div>
      <div className="text-center mx-auto w-full">OR</div>
      <Textarea
        placeholder="Paste multiple addresses here (separated by a comma)"
        className="h-24"
        onBlur={(e) => {
          const addresses = e.target.value
            .split(",")
            .map((addr) => addr.trim());
          const validAddresses = addresses.filter(
            (addr) => isAddress(addr) && !config.blacklist.includes(addr)
          );
          if (validAddresses.length > 0) {
            updateConfig({
              blacklist: [...config.blacklist, ...validAddresses],
            });
            e.target.value = "";
            toast(`Added ${validAddresses.length} new addresses to blacklist`);
          }
        }}
      />
    </div>
  );
}

function GeneralSection() {
  const [config, updateConfig] = useFrameConfig<Config>();
  const [localConfig, setLocalConfig] = useState(config);
  return (
    <>
      <h2 className="text-lg font-semibold">Token Contract Address</h2>
      <Input
        className="text-lg flex-1 h-10"
        placeholder="0x...."
        value={localConfig.tokenAddress}
        onChange={(e) => {
          updateConfig({
            tokenAddress: e.target.value,
          });
        }}
      />
      <h2 className="text-lg font-semibold">Chain</h2>
      <Select
        defaultValue={config.chain}
        onChange={async (value) => {
          updateConfig({
            chain: value as keyof typeof airdropChains,
          });
        }}
      >
        {Object.keys(airdropChains).map((option) => (
          <option key={option} value={option}>
            {option[0].toUpperCase() + option.slice(1)}
          </option>
        ))}
      </Select>

      <h2>Airdropper Address</h2>
      <Input
        className="text-lg flex-1 h-10"
        placeholder="Your address with the tokens"
        value={localConfig.walletAddress}
        onChange={(e) =>
          updateConfig({
            walletAddress: e.target.value,
          })
        }
      />
      <h2>Amount Per User</h2>
      <Input
        className="text-lg flex-1 h-10"
        placeholder="Amount"
        value={localConfig.generalAmount}
        onChange={(e) => {
          if (isNaN(Number(e.target.value))) {
            return;
          }
          updateConfig({
            generalAmount: Number(e.target.value),
          });
        }}
      />
      <h2>Cooldown Time (in seconds)</h2>
      <Input
        className="text-lg flex-1 h-10"
        placeholder="Amount"
        value={localConfig.cooldown}
        onChange={(e) => {
          let value = e.target.value;
          if (isNaN(Number(value)) || Number(value) < -1) {
            value = "-1";
          }
          updateConfig({
            generalAmount: Number(value),
          });
        }}
      />
    </>
  );
}

function WhiteListSection() {
  const [config, updateConfig] = useFrameConfig<Config>();
  const [newAddress, setNewAddress] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addWhitelistItem = () => {
    if (!isAddress(newAddress)) {
      toast("Invalid address");
      return;
    }
    const amount = Number(newAmount) || config.generalAmount;
    updateConfig({
      whitelist: [...config.whitelist, { address: newAddress, amount }],
    });
    setNewAddress("");
    setNewAmount("");
  };

  const removeWhitelistItem = (index: number) => {
    const newWhitelist = config.whitelist.filter((_, i) => i !== index);
    updateConfig({ whitelist: newWhitelist });
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split("\n");
      const newPairs: WhiteList[] = [];

      for (let line of lines) {
        let [address, amount] = line.split(",").map((item) => item.trim());
        if (isAddress(address)) {
          newPairs.push({
            address,
            amount: Number(amount) || config.generalAmount,
          });
        }
      }

      updateConfig({
        whitelist: [...config.whitelist, ...newPairs],
      });
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      {config.whitelist?.map((item, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <div className="flex gap-2">
            <div className="w-full">
              <Label htmlFor={`address-${index}`}>Address</Label>
              <Input id={`address-${index}`} value={item.address} readOnly />
            </div>
            <div>
              <Label htmlFor={`amount-${index}`}>Amount</Label>
              <Input id={`amount-${index}`} value={item.amount} readOnly />
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => removeWhitelistItem(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <div className="flex flex-col space-y-2">
        <div className="flex gap-2">
          <div className="w-full">
            <Label htmlFor="new-address">New Address</Label>
            <Input
              id="new-address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
          <div>
            <Label htmlFor="new-amount">New Amount</Label>
            <Input
              id="new-amount"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Enter amount (optional)"
            />
          </div>
        </div>
        <Button onClick={addWhitelistItem}>Add New Address</Button>
      </div>
      <div className="text-center mx-auto w-full">OR</div>
      <div>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload CSV
        </Button>
      </div>
    </div>
  );
}

function ButtonsSection() {
  const [mainConfig, updateMainConfig] = useFrameConfig<Config>();
  const [config, updateLocalConfig] = useState(mainConfig);
  const buttons = config.buttons;

  const updateConfig = (item: Partial<typeof config>) => {
    updateLocalConfig({ ...config, ...item });
  };

  const addButton = () => {
    const buttonsIndex = buttons.length + 2;
    const newButton: LinkButton = {
      action: "link",
      label: "button " + buttonsIndex,
      target: "https://frametra.in/frame/uo49holavp64zan5eu6zgxab",
    };
    updateConfig({
      //@ts-expect-error: link button should work
      buttons: [...buttons, newButton],
    });
    updateMainConfig({ buttons: [...buttons, newButton] });
  };

  const removeButton = (index: number) => {
    const newButtons = buttons.filter(
      (_, i) => i !== index
    ) as Config["buttons"];
    updateConfig({ buttons: newButtons });
    updateMainConfig({ buttons: newButtons });
  };

  const handleInputChange = (
    index: number,
    field: "target" | "label",
    value: string
  ) => {
    const newButtons = [...buttons] as Config["buttons"];
    newButtons[index][field] = value;
    updateConfig({ buttons: newButtons });
  };
  const handleInputBlur = (
    index: number,
    field: "target" | "label",
    value: string
  ) => {
    const newButtons = [...buttons] as Config["buttons"];
    newButtons[index][field] = value;
    updateMainConfig({ buttons: newButtons });
  };

  return (
    <div className="flex flex-col gap-4">
      {buttons.map((button, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor={`target-${index}`}>Target</Label>
              <Input
                id={`target-${index}`}
                value={button.target}
                onChange={(e) =>
                  handleInputChange(index, "target", e.target.value)
                }
                onBlur={(e) => {
                  handleInputBlur(index, "target", e.target.value);
                }}
                placeholder="External URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`label-${index}`}>Label</Label>
              <Input
                id={`label-${index}`}
                value={button.label}
                onChange={(e) =>
                  handleInputChange(index, "label", e.target.value)
                }
                onBlur={(e) => {
                  handleInputBlur(index, "label", e.target.value);
                }}
                placeholder="Label"
              />
            </div>
          </div>
          <Button variant="destructive" onClick={() => removeButton(index)}>
            Remove
          </Button>
        </div>
      ))}
      {buttons.length < 3 && (
        <Button onClick={addButton}>Add New Button</Button>
      )}
    </div>
  );
}
