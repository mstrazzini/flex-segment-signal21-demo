import '@twilio-labs/serverless-runtime-types'
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'
import Analytics from 'analytics-node'

type CustomContext = {
  SEGMENT_WRITE_KEY?: string
}

export const handler: ServerlessFunctionSignature = (
  context: Context<CustomContext>,
  event,
  callback: ServerlessCallback
) => {
  const { SEGMENT_WRITE_KEY } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string, { flushAt: 1, flushInterval: 2 })
  const userId = Math.floor(Math.random() * 10001) + 1001
  const newIdentity = { 
    userId,
    traits: {
      name: `Demo User ${userId}`,
      email: `demo${userId}@company.com`
    }
  }
  
  analytics.identify(newIdentity)

  setTimeout(() => {
    analytics.flush((err, data) => {
      if (err) callback(err)
      callback(null, data || newIdentity)
    })
  }, 3000)
}
