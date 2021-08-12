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

export const handler: ServerlessFunctionSignature = (
  context: Context<CustomContext>,
  event,
  callback: ServerlessCallback
) => {
  const { SEGMENT_WRITE_KEY, DEMO_CUSTOMER_PHONE } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string)
  const userId = Math.floor(Math.random() * 10001) + 1001
  const newIdentity = { 
    userId,
    traits: {
      name: `Demo User ${userId}`,
      email: `demo${userId}@company.com`,
      phoneNumber: DEMO_CUSTOMER_PHONE
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
