import request, { gql } from "graphql-request";
import { SUBGRAPH_URL } from "./const";

export async function getProfile(farcasterId: string) {
  try {
    const data: any = await request(
      SUBGRAPH_URL,
      gql`
        query GetProfile {
            profiles(where: {farcasterId: "${farcasterId}"}) {
              farcasterId
              id
              karmaGatingEnabled
              metadata
              prices
              timePeriods
              timeSlots
              totalBookings
              totalEarnings
              transactionHash
              receivedBookings {
                day
                id
                month
                timeStartInSeconds
                timePeriodInSeconds
                year
              }
            }
        }
      `,
      {}
    );
    console.log(`Profile for ${farcasterId}: `, data);
    return data?.profiles?.[0];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
