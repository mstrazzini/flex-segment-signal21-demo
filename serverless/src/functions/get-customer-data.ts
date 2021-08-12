import '@twilio-labs/serverless-runtime-types'
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'
import axios from 'axios'

type CustomContext = {
  PROFILE_API_SPACE_ID?: string,
  PROFILE_API_TOKEN?: string
}

type EventPayload = {
  userId?: string
}

export const handler: ServerlessFunctionSignature = async (
  context: Context<CustomContext>,
  event: EventPayload,
  callback: ServerlessCallback
) => {
  const { PROFILE_API_SPACE_ID, PROFILE_API_TOKEN } = context
  const { userId } = event
  const url = `https://profiles.segment.com/v1/spaces/${PROFILE_API_SPACE_ID}/collections/users/profiles/user_id:${userId}/traits`

  try {
    const result = await axios.get(url, {
      auth: {
        username: PROFILE_API_TOKEN as string,
        password: ''
      }
    })

    if (result.data) {
      callback(null, result.data)
    } else {
      callback('NOT_FOUND')
    }
  } catch (error) {
    console.error(error)
    callback(error)
  }
}
