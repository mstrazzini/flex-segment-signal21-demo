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
  reason?: 'FRAUD_PREVENT' | 'OVER_LIMIT' | 'UNKNOWN',
  amount?: number,
  city?: string,
  merchantName?: string,
  cardBlocked?: boolean,
  notifyBy?: 'SMS' | 'PHONE_CALL' | 'WHATSAPP' | 'APP_PUSH'
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
      journeyFlag: 'CARD_BLOCKED',
      securityQuestions: [
        {
          id: 'year_of_birth',
          label: 'Year of Birth',
          rightAnswer: '1982',
          status: 'PENDING'
        },
        {
          id: 'name_of_dog',
          label: 'Name of Dog',
          rightAnswer: 'Freddy',
          status: 'PENDING'
        }
      ]
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
