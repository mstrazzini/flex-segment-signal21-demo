import '@twilio-labs/serverless-runtime-types'
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'
import Analytics from 'analytics-node'

type EventPayload = {
  userId?: string,
  event?: string,
  properties?: any
}

type CustomContext = {
  SEGMENT_WRITE_KEY?: string
}

export const handler: ServerlessFunctionSignature = (
  context: Context<CustomContext>,
  event: EventPayload,
  callback: ServerlessCallback
) => {
  const { SEGMENT_WRITE_KEY } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string)
  
  analytics.track({
    userId: event.userId as string,
    event: event.event as string,
    properties: event.properties
  })
  
  setTimeout(() => {
    analytics.flush((err, data) => {
      if (err) {
        console.error(err)
        callback(err)
      } else {
        console.info('Event Data =>', JSON.stringify(data))
        callback(null, data)
      }
    })
  }, 2000)
  
}
