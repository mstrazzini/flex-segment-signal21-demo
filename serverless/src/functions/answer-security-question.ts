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
  PROFILE_API_TOKEN?: string
}

type EventPayload = {
  userId?: string,
  questionId?: string,
  answer?: number
}

export const handler: ServerlessFunctionSignature = async (
  context: Context<CustomContext>,
  event: EventPayload,
  callback: ServerlessCallback
) => {
  const { SEGMENT_WRITE_KEY, PROFILE_API_SPACE_ID, PROFILE_API_TOKEN } = context
  const analytics = new Analytics(SEGMENT_WRITE_KEY as string)
  const { userId, questionId, answer } = event
  const profileUrl = `https://profiles.segment.com/v1/spaces/${PROFILE_API_SPACE_ID}/collections/users/profiles/user_id:${userId}/traits`
  let customerData

  try {
    const result = await axios.get(profileUrl, {
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
  
  const securityQuestions: any[] = customerData.securityQuestions
  const securityQuestion = securityQuestions.find((i: any) => i.id === questionId && i.rightAnswer === answer)
  const answerIsCorrect = !!securityQuestion

  if (answerIsCorrect) {
    analytics.track({
      userId: userId as string,
      event: 'SECURITY_ANSWER_CORRECT',
      properties: {
        id: securityQuestion.id,
        answer
      }
    })

    securityQuestions.splice(securityQuestions.indexOf(securityQuestion), 1)

    // Update user traits
    analytics.identify({ 
      userId: userId as string,
      traits: {
        securityQuestions
      }
    })

  } else {
    analytics.track({
      userId: userId as string,
      event: 'SECURITY_ANSWER_INCORRECT',
      properties: {
        question: securityQuestions.find((i: any) => i.id === questionId),
        answer
      }
    })
  }

  setTimeout(() => {
    // Flush all pending data to Segment
    analytics.flush((err: Error, data: any) => {
      if (err) callback(err)
      callback(null, answerIsCorrect ? 'CORRECT': 'WRONG')
    })
  }, 2000)
  
}
