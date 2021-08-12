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
  name?: string
}

export const handler: ServerlessFunctionSignature = (
  context: Context<CustomContext>,
  event: EventPayload,
  callback: ServerlessCallback
) => {
  const { SEGMENT_WRITE_KEY, DEMO_CUSTOMER_PHONE } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string)
  const userId = event.userId as string
  const traitUpdates = { 
    userId,
    traits: {
      email: event.email,
      name: event.name,
      journeyFlag: null,
      securityQuestions: null,
      validation: null
    }
  }
  
  analytics.identify(traitUpdates)
  
  setTimeout(() => {
    analytics.flush((err: Error, data: any) => {
      if (err) callback(err)
      callback(null, data || traitUpdates)
    })
  }, 2000)
}
