"use client";

import React, { useState } from "react";
import { Table, Avatar, Badge, Button } from "@/sdk/components";
import { InferSelectModel } from "drizzle-orm";
import { frameTable } from "@/db/schema";
import { Storage } from "@/templates/airdrop";

interface User {
  fid: string;
  username: string;
  claimed: boolean;
  earnings: number;
  lastUsage: number;
}
const getUsers = (storage: Storage): User[] => {
  return Object.values(storage.users);
};

const getSortedUsers = (
  storage: Storage,
  sortBy: "earnings" | "recent"
): User[] => {
  const users = getUsers(storage);
  return users.sort((a, b) =>
    sortBy === "earnings" ? b.earnings - a.earnings : b.lastUsage - a.lastUsage
  );
};

// To be used to make search work
const searchUsers = (storage: Storage, query: string): User[] => {
  const lowercaseQuery = query.toLowerCase();
  return getUsers(storage).filter(
    (user) =>
      user.username.toLowerCase().includes(lowercaseQuery) ||
      `${user.fid}`.toLowerCase().includes(lowercaseQuery)
  );
};

// Mock data
const tokenInfo = {
  name: "AirToken",
  symbol: "AIR",
  image: "/placeholder.svg?height=64&width=64",
};


export default function AirdropPage({
  frame,
}: {
  frame: InferSelectModel<typeof frameTable>;
}) {
  const frameStorage = frame.storage as Storage;
  const [sortBy, setSortBy] = useState<"earnings" | "recent">("earnings");
  const sortedUsers = getSortedUsers(frameStorage, sortBy);
  const stats = {
    totalSent: frameStorage.totalAmountEarned ?? 0,
    peopleGiven: sortedUsers.length,
  };
  return (
    <div className="container mx-auto p-4 space-y-6 bg-[#17101f] text-gray-200">
      <div className="flex items-center space-x-4">
        <Avatar.Root className="h-16 w-16 ring-2 ring-purple-500">
          <Avatar.Image src={tokenInfo.image} alt={tokenInfo.name} />
          <Avatar.Fallback className="bg-purple-700 text-purple-100">
            {tokenInfo.symbol}
          </Avatar.Fallback>
        </Avatar.Root>
        <div>
          <h1 className="text-2xl font-bold text-purple-300">
            {tokenInfo.name}
          </h1>
          <Badge variant="secondary" className="bg-purple-700 text-purple-100">
            {tokenInfo.symbol}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700">
          <h2 className="text-lg font-semibold text-purple-300">Total Sent</h2>
          <p className="text-2xl font-bold text-purple-100">
            {stats.totalSent.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700">
          <h2 className="text-lg font-semibold text-purple-300">
            People Given
          </h2>
          <p className="text-2xl font-bold text-purple-100">
            {stats.peopleGiven.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-300">Users</h2>
          <div className="space-x-2">
            <Button
              variant={sortBy === "earnings" ? "default" : "outline"}
              onClick={() => setSortBy("earnings")}
              className={
                sortBy === "earnings"
                  ? "bg-purple-600 text-purple-100"
                  : "text-purple-300 border-purple-600 hover:bg-purple-800"
              }
            >
              Sort by Earnings
            </Button>
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              onClick={() => setSortBy("recent")}
              className={
                sortBy === "recent"
                  ? "bg-purple-600 text-purple-100"
                  : "text-purple-300 border-purple-600 hover:bg-purple-800"
              }
            >
              Sort by Recent
            </Button>
          </div>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row className="border-b border-purple-700">
              <Table.Head className="text-purple-300">Username</Table.Head>
              <Table.Head className="text-purple-300">Amount Earned</Table.Head>
              <Table.Head className="text-purple-300">Last Used</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedUsers.slice(0, 100).map((user) => (
              <Table.Row key={user.fid} className="border-b border-purple-800">
                <Table.Cell>
                  <a
                    href={`https://warpcast.com/${user.username}`}
                    className="text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    {user.username}
                  </a>
                </Table.Cell>
                <Table.Cell className="text-purple-200">
                  {user.earnings} {tokenInfo.symbol}
                </Table.Cell>
                <Table.Cell className="text-purple-200">
                  {new Date(user.lastUsage).toLocaleDateString()}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
