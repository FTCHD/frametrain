import request, { gql } from 'graphql-request'
import { SUBGRAPH_URL } from './const'

export async function getkarma(farcasterId: string) {
    try {
        const data: any = await request(
            SUBGRAPH_URL,
            gql`
         query GetProfile {
             profiles(where: {farcasterId: "${farcasterId}"}) {
                             karmaGatingEnabled
             }
         }
       `,
            {}
        )
        console.log('Profile: ', data?.profiles?.[0].karmaGatingEnabled)
        return data?.profiles?.[0].karmaGatingEnabled
    } catch (error) {
        console.error('Error fetching data:', error)
        return null
    }
}
