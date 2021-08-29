import { Component } from 'react'
import { Box, Button, Heading } from '@twilio-paste/core'
import { Theme } from '@twilio-paste/core/theme'
import { Manager, withTaskContext } from '@twilio/flex-ui'
import SecurityQuestion from '../SecurityQuestion'
import _ from 'lodash'

class SecurityCheck extends Component {
  constructor(props) {
    super(props)
    console.log('LOG => Security Check constructor called')
    this.unblockCard = this.unblockCard.bind(this)
    this.state = {
      unblockingCard: false
    }
  }

  unblockCard(event) {
    console.log('LOG => UNBLOCKING CARD')
    this.setState({ unblockingCard: true })
    // TODO: Implement Unblock Card logic (webservice call)
  }

  render() {
    const { task } = this.props
    const { unblockingCard } = this.state
    const globalState = Manager.getInstance().store.getState()['security-check']
    
    if (task && task.attributes.customerData) {
      const { customerData } = task.attributes
      const securityQuestionsForTask = 
        _.get(globalState, `securityCheck.securityQuestionsMap.${task.taskSid}`)

      console.log('LOG => PROPS', this.props)
      console.log('LOG => GLOBAL STATE', globalState)
      console.log('LOG => securityQuestionForTask', securityQuestionsForTask)
      

      if (customerData.securityQuestions.length > 0 && !securityQuestionsForTask) {
        const { taskSid } = task
        const { securityQuestions } = customerData
        console.log('LOG => Storing sec questions for task', task.taskSid, customerData.securityQuestions)
        Manager.getInstance().store.dispatch({
          type: 'UPDATE_SECURITY_QUESTIONS',
          payload: { taskSid, securityQuestions }
        })
        return 'LOADING SECURITY QUESTIONS'
      } else {
        return (
          <Theme.Provider theme='default'>
            <Box marginTop="space30" marginBottom="space30" padding="space30">
              <Heading as='h1' variant='heading10'>Security Check</Heading>
              <Heading as='h3' variant='heading30'>
                Reason: {customerData.journeyFlag || 'UNKNOWN'}
              </Heading>
              {securityQuestionsForTask.map(i => 
                <SecurityQuestion key={i.key} userId={customerData.userId} question={i} />
              )}
              <Button 
                variant="primary"
                id={`btn_unblock_card`}
                onClick={this.unblockCard}
                loading={unblockingCard}
                disabled={securityQuestionsForTask.length > 0}
              >
                Unblock Card
              </Button>
            </Box>
          </Theme.Provider>
        )
      }
    } else {
      return null
    }
  }
}

export default withTaskContext(SecurityCheck)
