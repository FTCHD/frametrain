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
      {/* <Configuration.Section title="Claimed">
        <p>{JSON.stringify(config)}</p>
        <h2 className="text-lg font-semibold">Starter Template</h2>

        <h3 className="text-lg font-semibold">Text</h3>

        <p>{text}</p>

        <div className="flex flex-col gap-2 ">
          <Input
            className="text-lg"
            placeholder="Input something"
            ref={displayLabelInputRef}
          />
          <Button
            onClick={() => {
              if (!displayLabelInputRef.current?.value) return;

              updateConfig({ text: displayLabelInputRef.current.value });

              displayLabelInputRef.current.value = "";
            }}
            className="w-full bg-border hover:bg-secondary-border text-primary"
          >
            Set Text
          </Button>
        </div>

        <Button
          variant="destructive"
          className="w-full "
          onClick={() => updateConfig({ text: "" })}
        >
          Delete
        </Button>
      </Configuration.Section> */}
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
  const [_, updateConfig] = useFrameConfig<Config>();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const handleSave = () => {
    const addressList = inputValue.split(",").map((addr) => addr.trim());
    const validAddresses = addressList.filter((addr) =>
      isAddress(addr)
    ) as string[];

    setAddresses(validAddresses);
    updateConfig({ blacklist: validAddresses });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setInputValue(addresses.join(", "));
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {isEditing ? (
        <Textarea
          className="placeholder:italic"
          placeholder="Comma separated addresses.."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      ) : (
        <div className="p-2 border rounded bg-gray-50">
          {addresses.length > 0 ? addresses.join(", ") : "No valid addresses."}
        </div>
      )}

      <div className="flex gap-2">
        {isEditing ? (
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>
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
          setLocalConfig({
            ...localConfig,
            tokenAddress: e.target.value,
          });
        }}
        onBlur={(e) => {
          if (!isAddress(e.target.value)) {
            toast.error("Invalid Contract address");
            return;
          }
          updateConfig({
            tokenAddress: e.target.value,
          });
        }}
      />
      <h2 className="text-lg font-semibold">Chain</h2>
      <Select
        defaultValue={config.chain}
        onChange={async (value) => {
          setLocalConfig({
            ...localConfig,
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
          setLocalConfig({ ...localConfig, walletAddress: e.target.value })
        }
        onBlur={(e) => {
          if (!isAddress(e.target.value)) {
            toast.error("Invalid wallet address");
            return;
          }
          updateConfig({
            walletAddress: e.target.value,
          });
        }}
      />
      <h2>Amount Per User</h2>
      <Input
        className="text-lg flex-1 h-10"
        placeholder="Amount"
        value={localConfig.generalAmount}
        onChange={(e) =>
          setLocalConfig({
            ...localConfig,
            generalAmount: Number(e.target.value),
          })
        }
        onBlur={(e) => {
          if (isNaN(Number(e.target.value))) {
            toast.error("Invalid amount");
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
        onChange={(e) =>
          setLocalConfig({ ...localConfig, cooldown: Number(e.target.value) })
        }
        onBlur={(e) => {
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
  const [mainConfig, updateMainConfig] = useFrameConfig<Config>();
  const [config, updateLocalConfig] = useState(mainConfig);
  const updateConfig = (item: Partial<typeof config>) => {
    updateLocalConfig({ ...config, ...item });
  };
  const whitelist = config.whitelist;
  const setLocalWhitelist = (pairs: WhiteList[]) => {
    updateConfig({ whitelist: pairs });
  };
  const setMainWhitelist = (pairs: WhiteList[]) => {
    updateMainConfig({ whitelist: pairs });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addWhitelistItem = () => {
    const amount = config.generalAmount || 1;
    setLocalWhitelist([...whitelist, { address: "", amount }]);
    setMainWhitelist([...whitelist, { address: "", amount }]);
  };

  const removeWhitelistItem = (index: number) => {
    const newItem = whitelist.filter((_, i) => i !== index);
    setLocalWhitelist(newItem);
    setMainWhitelist(newItem);
  };

  const handleInputChange = (
    index: number,
    field: "address" | "amount",
    value: string
  ) => {
    const newItem = [...whitelist];
    //@ts-expect-error: indexing into objects
    newItem[index][field] = value;
    setLocalWhitelist(newItem);
  };
  const handleInputBlur = (
    index: number,
    field: "address" | "amount",
    value: string | number
  ) => {
    const newItem = [...whitelist];
    //@ts-expect-error: indexing into objects
    newItem[index][field] = value;
    setMainWhitelist(newItem);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split("\n");
      const newPairs: WhiteList[] = [];

      for (let i = 0; i < lines.length; i++) {
        let [address, amount] = lines[i].split(",").map((item) => item.trim());
        if (isAddress(address) && amount) {
          if (isNaN(Number(amount)))
            amount = config.generalAmount.toString() || "1";
          newPairs.push({ address, amount: Number(amount) });
        } else if (lines[i].trim() !== "") {
          continue;
        }
      }
      setMainWhitelist([...whitelist, ...newPairs]);
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4">
      {whitelist.map((pair, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              {/* <Label htmlFor={`address-${index}`}>Address</Label> */}
              <Input
                id={`address-${index}`}
                value={pair.address}
                onChange={(e) =>
                  handleInputChange(index, "address", e.target.value)
                }
                onBlur={(e) => {
                  const address = e.target.value;
                  if (!isAddress(address)) {
                    toast("Invalid adresss");
                    return;
                  }
                  handleInputBlur(index, "address", address);
                }}
                placeholder="Enter address"
              />
            </div>
            <div>
              {/* <Label htmlFor={`amount-${index}`}>Amount</Label> */}
              <Input
                id={`amount-${index}`}
                value={pair.amount}
                onChange={(e) =>
                  handleInputChange(index, "amount", e.target.value)
                }
                onBlur={(e) => {
                  let amount = Number(e.target.value);
                  if (isNaN(amount) || !amount)
                    amount = mainConfig.generalAmount || 1;
                  handleInputBlur(index, "amount", amount);
                }}
                placeholder="Enter amount (optional)"
              />
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
      <Button onClick={addWhitelistItem}>Add New Pair</Button>
      <div>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          Upload CSV
        </Button>
      </div>
      {/* <div className="flex flex-col gap-2 w-full">
          <h2 className="text-lg font-semibold">Whitelist Type</h2>
          <RadioGroup.Root
            defaultValue={whitelistType}
            className="flex flex-row"
            onValueChange={(val) => {
              const value = val as "inputs" | "csv";
              setWhitelistType(value);
              if (val === "input" && config.cover.image) {
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
              <RadioGroup.Item value="inputs" id="inputs" />
              <Label htmlFor="inputs">Inputs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroup.Item value="csv" id="csv" />
              <Label htmlFor="csv">CSV</Label>
            </div>
          </RadioGroup.Root>
        </div>
        <div className="flex flex-col gap-4 w-full">
          {whitelistType === "inputs" ? (
            <>
              <div className="flex flex-col gap-2 w-full">
                <h2>Address 1</h2>
                <Input
                  className="text-lg flex-1 h-10"
                  placeholder="0x..."
                  onBlur={(e) => {
                    console.log("Address 1 updated");
                  }}
                />
                <h2>Ammount</h2>
                <Input
                  className="text-lg flex-1 h-10"
                  placeholder="Optional"
                  onBlur={(e) => {
                    console.log("Address 1 updated");
                  }}
                />
                <Button
                  onClick={() => {
                    console.log("Removed Address 1");
                  }}
                >
                  Remove
                </Button>
              </div>
              <Button
                onClick={() => {
                  console.log("Added new address");
                }}
              >
                Add Address
              </Button>
            </>
          ) : (
            <div className="w-fit bg-blue-400">
              <label
                htmlFor="uploadFile"
                className="flex cursor-pointer items-center justify-center rounded-md py-1.5 px-2 text-md font-medium bg-border text-primary hover:bg-secondary-border"
              >
                Upload a file
                <Input
                  type="file"
                  id="uploadCsv"
                  className="sr-only"
                  accept="application/jpeg"
                  onChange={async (e) => {
                    //Get inputs from csv uploaded
                  }}
                />
              </label>
            </div>
          )}
        </div> */}
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
      type: "link",
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
