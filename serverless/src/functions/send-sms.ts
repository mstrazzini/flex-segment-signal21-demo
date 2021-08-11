import '@twilio-labs/serverless-runtime-types'
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types'

type EventPayload = {
  to?: string,
  body?: string
}

type CustomContext = {
  SMS_FROM_NUMBER?: string
}

export const handler: ServerlessFunctionSignature = (
  context: Context<CustomContext>,
  event: EventPayload,
  callback: ServerlessCallback
) => {
  const twilioClient = context.getTwilioClient()

  if (!event.to) {
    callback('MISSING_TO_NUMBER')
  } else if (!event.body) {
    callback('EMPTY_MESSAGE')
  } else {
    twilioClient.messages
      .create({
        from: context.SMS_FROM_NUMBER,
        to: event.to as string,
        body: event.body as string
      })
      .then(result => {
        callback(null, result)
      })
      .catch(err => {
        console.error(err)
        callback(err)
      })
  }
}
