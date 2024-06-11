import type { Config } from "..";
import { createTimeSlots } from "../utils/createTimeSlot";
import { getNextSixDates } from "../utils/date";

import gettimeslot from "../utils/getTimeSlots";
export default async function CoverView(config: Config) {
  //   const [configs, updateConfig] = useFrameConfig<Config>();
  const { ownerFid } = config;
  const t = config.slot;
  console.log("slots : " + t);

  const timeSlots = await gettimeslot(ownerFid.toString());
  const timeslots = createTimeSlots(timeSlots);
  const dates = getNextSixDates();
  console.log(timeslots[config.slot] + "- slot");
  console.log(dates[config.date] + " - date");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        // justifyContent: "center",

        width: "100%",
        height: "100%",
        backgroundColor: "black",
        padding: 50,
        fontSize: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 64,
            }}
          >
            CalCast
          </div>
          <div
            style={{
              color: "white",
              display: "flex",
              gap: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ color: "white", fontSize: 32 }}>
              {config.ownerName}
            </div>
            <img
              src={config.ownerImg}
              alt="Circular"
              style={{
                borderRadius: "50%",
                border: "1px solid white",
                width: 68,
                height: 68,
              }}
            />
            <img
              src="https://calcast.vercel.app/calendar.png"
              width={64}
              height={64}
              alt="calendar"
            />
          </div>
        </div>
        <div
          style={{
            color: "gray",
            fontSize: 40,
          }}
        >
          Scheduling Infrastructure for Farcaster
        </div>
      </div>

      <div
        style={{
          color: "white",
          display: "flex",
          marginTop: 50,
          fontSize: 36,
        }}
      >
        Choose a Time
      </div>
      {/* {visibleTimeSlots.map((timeSlot, index) => (
            <div key={index} style={{ color: "white" }}>
              {timeSlot}
            </div>
          ))} */}
      <div
        style={{
          color: "white",
          display: "flex",
          gap: 20,
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: 10,
        }}
      >
        <div>{`Schedule call with ${config.ownerName} on ${
          dates[config.date]
        } at ${timeslots[config.slot]}`}</div>
      </div>
    </div>
  );
}
