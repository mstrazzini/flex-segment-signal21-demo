import _ from 'lodash'

const ACTION_UPDATE_SECURITY_QUESTIONS = 'UPDATE_SECURITY_QUESTIONS'
const ACTION_COMPLETE_SECURITY_QUESTION = 'COMPLETE_SECURITY_QUESTION'

const initialState = {
  securityQuestionsMap: {},
}

export class Actions {
  static updateSecurityQuestions = () => ({ type: ACTION_UPDATE_SECURITY_QUESTIONS })
  static completeSecurityQuestion = () => ({ type: ACTION_COMPLETE_SECURITY_QUESTION })
}

export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_UPDATE_SECURITY_QUESTIONS: {
      console.log('LOG => ACTION PAYLOAD', action.payload)
      const { taskSid, securityQuestions } = action.payload
      return {
        ...state,
        securityQuestionsMap: {
          ...state.securityQuestionsMap,
          [taskSid]: securityQuestions
        }
      }
    }

    case ACTION_COMPLETE_SECURITY_QUESTION: {
      const { taskSid, questionId } = action.payload
      return {
        ...state,
        securityQuestionsMap: {
          ...state.securityQuestionsMap,
          [taskSid]: state.securityQuestionsMap[taskSid]
            .filter(i => i.id !== questionId)
        }
      }
    }

    default:
      return state
  }
}
