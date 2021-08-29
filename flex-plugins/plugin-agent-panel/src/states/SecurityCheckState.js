import _ from 'lodash'

const ACTION_UPDATE_SECURITY_QUESTIONS = 'UPDATE_SECURITY_QUESTIONS'
const ACTION_COMPLETE_SECURITY_QUESTION = 'COMPLETE_SECURITY_QUESTION'

const initialState = {
  securityQuestionsMap: {},
}

export class Actions {
  static updateSecurityQuestions = (taskSid, securityQuestions) => {
    console.log('LOG => updateSecurityQuestions called', taskSid, securityQuestions)
    return { 
      type: ACTION_UPDATE_SECURITY_QUESTIONS,
      payload: {
        taskSid,
        securityQuestions
      } 
    }
  }
  static completeSecurityQuestion = (taskSid, questionId) => ({
    type: ACTION_COMPLETE_SECURITY_QUESTION,
    payload: {
      taskSid,
      questionId
    }
  })
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
            .map(i => {
              if (i.id === questionId) {
                return {
                  ...i,
                  status: 'ANSWERED'
                }
              } else {
                return i
              }
            })
        }
      }
    }

    default:
      return state
  }
}
