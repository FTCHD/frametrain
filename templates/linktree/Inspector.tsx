"use client";

import { Button, ColorPicker, Input } from "@/sdk/components";
import { useFarcasterId, useFrameConfig } from "@/sdk/hooks";
import { Configuration } from "@/sdk/inspector";
import { getFarcasterProfiles } from "@/sdk/neynar";
import {
  BookOpen,
  Cast,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Config, LinkType } from ".";
import { Farcaster } from "./icons";
import toast from "react-hot-toast";
import { link } from "fs";

const linkIcons: Record<LinkType, React.ReactNode> = {
  twitter: <Twitter className="w-14 h-14" />,
  warpcast: <Farcaster className="w-14 h-14" />,
  website: <Globe className="w-14 h-14" />,
  blog: <BookOpen className="w-14 h-14" />,
  github: <Github className="w-14 h-14" />,
  linkedin: <Linkedin className="w-14 h-14" />,
  instagram: <Instagram className="w-14 h-14" />,
};

export default function LinkTree() {
  const [config, updateConfig] = useFrameConfig<Config>();
  const fid = useFarcasterId();
  useEffect(() => {
    async function setUserData() {
      if (config.userData) {
        return;
      }
      try {
        const users = await getFarcasterProfiles([fid]);
        console.log({ users });
        const user = users[0];
        const userData = {
          userImageUrl: user.pfp_url,
          username: user.username,
        };
        updateConfig({
          userData,
        });
      } catch {}
    }

    setUserData();
  }, []);
  return (
    <Configuration.Root>
      <Configuration.Section title="Links">
        <LinksSection />
      </Configuration.Section>
      <Configuration.Section title="Appearance">
        <CoverSection />
      </Configuration.Section>
    </Configuration.Root>
  );
}

function LinksSection() {
  const [config, updateConfig] = useFrameConfig<Config>();
  const [newLinkType, setNewLinkType] = useState<LinkType>("website");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  function isValidURL(url: string) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  const addLink = () => {
    //Check that the new url is a valid url
    if (newLinkUrl) {
      if (!isValidURL(newLinkUrl)) {
        toast.error(`Invalid URL: ${newLinkUrl}`);
        return;
      }
      updateConfig({
        links: [
          ...(config.links || []),
          { type: newLinkType, url: newLinkUrl },
        ],
      });
      setNewLinkUrl("");
    }
  };

  const removeLink = (index: number) => {
    const newLinks = [...config.links];
    newLinks.splice(index, 1);
    updateConfig({ links: newLinks });
  };

  return (
    <div className="space-y-4">
      {config.links?.map((link, index) => (
        <div key={index} className="flex items-center space-x-2">
          {linkIcons[link.type]}
          <Input value={link.url} readOnly className="flex-grow" />
          <Button variant="destructive" onClick={() => removeLink(index)}>
            Remove
          </Button>
        </div>
      ))}
      <div className="flex items-center space-x-2">
        <select
          className="border rounded px-2 py-3"
          value={newLinkType}
          onChange={(e) => setNewLinkType(e.target.value as LinkType)}
        >
          <option value="website">Website</option>
          <option value="twitter">Twitter</option>
          <option value="warpcast">Warpcast</option>
          <option value="blog">Blog</option>
          <option value="github">GitHub</option>
          <option value="linkedin">LinkedIn</option>
          <option value="instagram">Instagram</option>
        </select>
        <Input
          placeholder="Enter URL"
          value={newLinkUrl}
          onChange={(e) => setNewLinkUrl(e.target.value)}
          className="flex-grow"
        />

        <Button onClick={addLink}>Add Link</Button>
      </div>
    </div>
  );
}

function CoverSection() {
  const [config, updateConfig] = useFrameConfig<Config>();
  console.log(config);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Background Color</h2>
        <ColorPicker
          className="w-full"
          background={config.cover.backgroundColor}
          setBackground={(value) =>
            updateConfig({ cover: { ...config.cover, backgroundColor: value } })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Title Text</h2>
        <Input
          defaultValue={config.cover.title}
          onChange={(e) => {
            updateConfig({ cover: { ...config.cover, title: e.target.value } });
          }}
          placeholder="Enter title"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Title Color</h2>
        <ColorPicker
          className="w-full"
          background={config.cover.titleColor}
          setBackground={(value) =>
            updateConfig({ cover: { ...config.cover, titleColor: value } })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">LinkTree Color</h2>
        <ColorPicker
          className="w-full"
          background={config.cover.linkTreeColor ?? config.cover.titleColor}
          setBackground={(value) =>
            updateConfig({ cover: { ...config.cover, linkTreeColor: value } })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Username Color</h2>
        <ColorPicker
          className="w-full"
          background={config.cover.usernameColor || "#ffffff"}
          setBackground={(value) =>
            updateConfig({ cover: { ...config.cover, usernameColor: value } })
          }
        />
      </div>
    </div>
  );
}
