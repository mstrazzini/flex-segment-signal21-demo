import '@twilio-labs/serverless-runtime-types'
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'
import Analytics from 'analytics-node'

type CustomContext = {
  SEGMENT_WRITE_KEY?: string,
  DEMO_CUSTOMER_PHONE?: string
}

type EventPayload = {
  userId?: string,
  email?: string,
  name?: string,
  phoneNumber?: string
}

export const handler: ServerlessFunctionSignature = (
  context: Context<CustomContext>,
  event: EventPayload,
  callback: ServerlessCallback
) => {
  const { SEGMENT_WRITE_KEY, DEMO_CUSTOMER_PHONE } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string)
  const userId = event.userId || Math.floor(Math.random() * 8999) + 1001
  const newIdentity = { 
    userId,
    traits: {
      name: event.name || `Demo User ${userId}`,
      email: event.email || `demo${userId}@company.com`,
      phoneNumber: event.phoneNumber || DEMO_CUSTOMER_PHONE
    }
  }

  const flushCallback = (err: Error, data: any) => {
    if (err) callback(err)
    callback(null, data || newIdentity)
  }
  
  analytics.identify(newIdentity)
  
  setTimeout(() => {
    analytics.flush(flushCallback)
  }, 2000)
}
