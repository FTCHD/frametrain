import type { Config } from "..";
import { createTimeSlots } from "../utils/createTimeSlot";

import gettimeslot from "../utils/getTimeSlots";
export default async function CoverView(config: Config) {
  //   const [configs, updateConfig] = useFrameConfig<Config>();
  const { ownerFid } = config;
  const t = 0;

  const timeSlots = await gettimeslot(ownerFid.toString());
  const timeslots = createTimeSlots(timeSlots);
  console.log(timeslots);
  const visibleIndex = Math.floor(Number.parseInt(t.toString()) / 4);

  const startIndex = visibleIndex * 4;
  const endIndex = Math.min(startIndex + 4, timeslots.length);
  const visibleTimeSlots = timeslots.slice(startIndex, endIndex);
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
        {visibleTimeSlots.map((timeSlot, index) => (
          <div
            key={index}
            style={{
              fontSize: 30,
              padding: 15,
              paddingLeft: 20,
              backgroundColor:
                index === Number.parseInt(t.toString()) % 4 ? "white" : "none",
              color:
                index === Number.parseInt(t.toString()) % 4 ? "black" : "white",
              border:
                index === Number.parseInt(t.toString()) % 4
                  ? "none"
                  : "1px solid gray",
              borderRadius: 15,
            }}
          >
            {timeSlot}
          </div>
        ))}
      </div>
    </div>
  );
}
