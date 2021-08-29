import { Component } from 'react'
import { Box, Button, Heading } from '@twilio-paste/core'
import { Theme } from '@twilio-paste/core/theme'
import { Actions, withTaskContext } from '@twilio/flex-ui'
import SecurityQuestion from '../SecurityQuestion'
import _ from 'lodash'
import axios from 'axios'

class SecurityCheck extends Component {
  constructor(props) {
    super(props)
    console.log('LOG => Security Check constructor called')
    this.unblockCard = this.unblockCard.bind(this)
    this.state = {
      securityQuestions: [],
      unblockingCard: false,
      cardStatus: 'BLOCKED',
      serviceUrl: 'https://serverless-9217-dev.twil.io/unblock-card'
    }

    Actions.registerAction('securityQuestionAnswered', (event) => {
      const questionId = event
      console.log('LOG => ACTION securityQuestionAnswered triggered', questionId)
      console.log('LOG => LOCAL STATE SNAPSHOT =>', this.state)
      const securityQuestions = this.state.securityQuestions.map(i => {
        if (i.id === questionId) {
          return {
            ...i,
            status: 'ANSWERED'
          }
        } else {
          return i
        }
      })
      this.setState({
        updatingSecurityQuestions: true,
        securityQuestions
      }, () => {
        console.log('LOG => LOCAL STATE SNAPSHOT AFTER UPDATE =>', this.state)
      })
    })
  }

  async unblockCard(event) {
    const userId = event
    console.log('LOG => UNBLOCKING CARD FOR USER ID', userId)
    this.setState({ unblockingCard: true })
    
    await axios.post(this.state.serviceUrl, {
      userId,
    }).then(response => {
      this.setState({ unblockingCard: false })
      if (response.error) {
        console.error(response.error)
      } else {
        const result = response.data
        console.log('LOG => UNBLOCK CARD RESULT =>', result)

        if (result === 'SUCCESS') {
          this.setState({ cardStatus: 'UNBLOCKED' })
        }
      }
    })
  }

  componentDidMount() {
    const { task } = this.props
    console.log('LOG => TASK ATTRIBUTES AT componentDidMount', task.attributes)
    if (!this.state.securityQuestionsLoaded && task && task.attributes.customerData) {
      const { securityQuestions } = task.attributes.customerData
      console.log('LOG => Loading sec questions for task', task.taskSid, securityQuestions)
      this.setState({ securityQuestions })
    }
  }

  render() {
    console.log('LOG => SEC CHECK RENDERING...', this.state)
    const { task } = this.props
    const { unblockingCard } = this.state
    
    if (task && task.attributes.customerData) {
      const { customerData } = task.attributes
      const pendingSecurityQuestions = this.state.securityQuestions
        .filter(i => i.status === 'PENDING')
      console.log('LOG => PENDING SEC QUESTIONS =>', pendingSecurityQuestions)
      
      if (pendingSecurityQuestions.length > 0) {
        return (
          <Theme.Provider theme='default'>
            <Box marginTop="space30" marginBottom="space30" padding="space30">
              <Heading as='h1' variant='heading10'>Security Check</Heading>
              <Heading as='h3' variant='heading30'>
                Reason: {customerData.journeyFlag || 'UNKNOWN'}
              </Heading>
              {
                pendingSecurityQuestions
                  .map(i => <SecurityQuestion key={i.key} userId={customerData.userId} question={i} />)
              }
            </Box>
          </Theme.Provider>
        )
      } else if (this.state.cardStatus === 'BLOCKED') {
        return (
          <Theme.Provider theme='default'>
            <Box marginTop="space30" marginBottom="space30" padding="space30">
              <Heading as='h1' variant='heading10'>Security Check</Heading>
              <Heading as='h3' variant='heading30'>
                All security questions answered. Unblock card?
              </Heading>
              <Button 
                variant="primary"
                id={`btn_unblock_card`}
                onClick={e => this.unblockCard(customerData.userId, e)}
                loading={unblockingCard}
              >
                Unblock Card
              </Button>
            </Box>
          </Theme.Provider>
        )
      } else if (this.state.cardStatus === 'UNBLOCKED') {
        return (
          <Theme.Provider theme='default'>
            <Box marginTop="space30" marginBottom="space30" padding="space30">
              <Heading as='h1' variant='heading10'>Security Check</Heading>
              <Heading as='h3' variant='heading30'>
                Card has been successfully unblocked!
              </Heading>
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
