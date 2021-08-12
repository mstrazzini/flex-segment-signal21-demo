import '@twilio-labs/serverless-runtime-types'
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'
import Analytics from 'analytics-node'
import axios from 'axios'

type CustomContext = {
  SEGMENT_WRITE_KEY?: string,
  PROFILE_API_SPACE_ID?: string,
  PROFILE_API_TOKEN?: string,
  DEMO_CUSTOMER_PHONE?: string,
  CALL_CENTER_NUMBER?: string,
  SMS_FROM_NUMBER?: string
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

export const handler: ServerlessFunctionSignature = async (
  context: Context<CustomContext>,
  event: EventPayload,
  callback: ServerlessCallback
) => {
  const { SEGMENT_WRITE_KEY, DEMO_CUSTOMER_PHONE, PROFILE_API_SPACE_ID, PROFILE_API_TOKEN } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string)
  const userId = event.userId as string
  const { reason, amount, city, merchantName, cardBlocked, notifyBy } = event
  let customerData
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

  // Get customer data/traits, so we can use other traits (like email) to
  // trigger the CARD_BLOCKED event
  
  const url = `https://profiles.segment.com/v1/spaces/${PROFILE_API_SPACE_ID}/collections/users/profiles/user_id:${userId}/traits`

  try {
    const result = await axios.get(url, {
      auth: {
        username: PROFILE_API_TOKEN as string,
        password: ''
      }
    })

    if (result.data && result.data.traits) {
      customerData = result.data.traits
    }
  } catch (error) {
    console.error(error)
    callback(error)
  }
  
  // Trigger CARD_DECLINED event
  analytics.track({
    userId,
    event: 'CARD_DECLINED',
    properties: { reason, amount, city, merchantName, cardBlocked, notifyBy }
  })

  // Update user traits
  analytics.identify(traitUpdates)

  setTimeout(() => {
    // Flush all pending data to Segment
    analytics.flush((err: Error, data: any) => {
      if (err) callback(err)

      // Notify user (optional)
      if (event.notifyBy === 'SMS' && event.cardBlocked) {
        const { CALL_CENTER_NUMBER } = context

        context.getTwilioClient().messages
          .create({
            from: context.SMS_FROM_NUMBER,
            to: DEMO_CUSTOMER_PHONE as string, // TODO: get number from user traits
            body: `Your card has been suspended by fraud prevention. Please contact us as ${CALL_CENTER_NUMBER}`
          })
          .then(result => {
            console.info(`SMS notification sent sucessfully (${result.sid})`)
            callback(null, data || traitUpdates)
          })
          .catch(err => {
            console.error(err)
            callback(err)
          })
      } else {
        callback(null, data || traitUpdates)
      }
    })
  }, 2000)
  
}
