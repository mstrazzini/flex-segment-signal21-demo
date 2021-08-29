import '@twilio-labs/serverless-runtime-types'
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'
import Analytics from 'analytics-node'

type CustomContext = {
  SEGMENT_WRITE_KEY?: string,
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
  const response = new Twilio.Response()
  response.appendHeader('Access-Control-Allow-Origin', '*')
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET')
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type')

  const { SEGMENT_WRITE_KEY } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string)

  analytics.track({
    userId: event.userId as string,
    event: 'CARD_UNBLOCKED'
  })

  analytics.identify({ 
    userId: event.userId as string,
    traits: {
      journeyFlag: null
    }
  })

  setTimeout(() => {
    // Flush all pending data to Segment
    analytics.flush((err: Error, data: any) => {
      if (err) {
        console.error(err)
        response.appendHeader('Content-Type', 'plain/text')
        response.setBody(err.message)
        response.setStatusCode(500)
        callback(null, response)
      } else {
        response.appendHeader('Content-Type', 'plain/text')
        response.setBody('SUCCESS')
        callback(null, response)
      }
    })
  }, 2000)
}
