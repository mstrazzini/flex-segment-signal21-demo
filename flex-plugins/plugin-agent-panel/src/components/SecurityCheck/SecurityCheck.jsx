import { Component } from 'react'
import { Box, Button, Heading } from '@twilio-paste/core'
import { Theme } from '@twilio-paste/core/theme'
import { withTaskContext } from '@twilio/flex-ui'
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
    
  }

  render() {
    const { task } = this.props
    const { unblockingCard } = this.state
    
    if (task && task.attributes.customerData) {
      const { customerData } = task.attributes
      const { securityQuestions } = customerData
      console.log('LOG => Customer Data => ', customerData)

      return (
        <Theme.Provider theme='default'>
          <Box marginTop="space30" marginBottom="space30" padding="space30">
            <Heading as='h1' variant='heading10'>Security Check</Heading>
            <Heading as='h3' variant='heading30'>
              Reason: {customerData.journeyFlag || 'UNKNOWN'}
            </Heading>
            {securityQuestions.map(i => 
              <SecurityQuestion key={i.key} userId={customerData.userId} question={i} />
            )}
            <Button 
              variant="primary"
              id={`btn_unblock_card`}
              onClick={this.unblockCard}
              loading={unblockingCard}
              disabled={securityQuestions.length > 0}
            >
              Unblock Card
            </Button>
          </Box>
        </Theme.Provider>
      )
    } else {
      return null
    }
  }
}

export default withTaskContext(SecurityCheck)
