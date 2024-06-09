import { request, gql } from "graphql-request";
import { SUBGRAPH_URL } from "../utils/const";

async function gettimeslot(farcasterId: string) {
  try {
    const data: any = await request(
      SUBGRAPH_URL,
      gql`
        query GetProfile {
            profiles(where: {farcasterId: "${farcasterId}"}) {
              timeSlots
            }
        }
      `,
      {}
    );
    console.log("Profile: ", data?.profiles?.[0].timeSlots);
    return data?.profiles?.[0].timeSlots;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default gettimeslot;
