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
      loadedSecurityQuestions: false,
      unblockingCard: false,
      cardStatus: 'UNKNOWN',
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

    Actions.addListener('beforeAcceptTask', payload => {
      console.log('LOG => beforeAcceptTask payload', payload)
      this.setState({
        securityQuestions: [],
        cardStatus: 'UNKNOWN'
      }, () => {
        const { task } = payload
        const { securityQuestions } = task.attributes.customerData
        console.log('LOG => Loading sec questions for task', task.taskSid, securityQuestions)
        this.setState({ securityQuestions, loadedSecurityQuestions: true, cardStatus: 'BLOCKED' })
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
          this.setState({ cardStatus: 'UNBLOCKED', securityQuestions: [] })
        }
      }
    })
  }

  componentDidMount() {
    const { task } = this.props
    console.log('LOG => COMPONENT SecurityCheck mounted', task)
    this.setState({ cardStatus: 'BLOCKED' })
  }

  // componentWillUnmount() {
  //   this.setState({
  //     securityQuestions: [],
  //     loadedSecurityQuestions: false,
  //     unblockingCard: false,
  //     cardStatus: 'UNKNOWN',
  //     serviceUrl: 'https://serverless-9217-dev.twil.io/unblock-card'
  //   })
  // }

  render() {
    console.log('LOG => SEC CHECK RENDERING...', this.state)
    const { task } = this.props
    const { unblockingCard } = this.state
    
    if (task && task.attributes.customerData) {
      const { customerData } = task.attributes
      const pendingSecurityQuestions = this.state.securityQuestions
        .filter(i => i.status === 'PENDING')
      console.log('LOG => PENDING SEC QUESTIONS =>', pendingSecurityQuestions)
      console.log('LOG => LOCAL STATE =>', this.state)

      if (this.state.loadedSecurityQuestions) {
        if (pendingSecurityQuestions.length > 0) {
          return (
            <Theme.Provider theme='default'>
              <Box marginTop="space30" marginBottom="space30" padding="space30">
                <Heading as='h1' variant='heading10'>Verificação de Segurança</Heading>
                <Heading as='h3' variant='heading30'>
                  Motivo: Compra suspeita
                </Heading>
                {
                  pendingSecurityQuestions
                    .map(i => <SecurityQuestion key={i.key} userId={customerData.userId} question={i} />)
                }
              </Box>
            </Theme.Provider>
          )
        } else if (this.state.cardStatus === 'UNBLOCKED') {
          return (
            <Theme.Provider theme='default'>
              <Box marginTop="space30" marginBottom="space30" padding="space30">
                <Heading as='h1' variant='heading10'>Verificação de Segurança</Heading>
                <Heading as='h3' variant='heading30'>
                  Cartão desbloqueado com sucesso!
                </Heading>
              </Box>
            </Theme.Provider>
          )
        } else {
          return (
            <Theme.Provider theme='default'>
              <Box marginTop="space30" marginBottom="space30" padding="space30">
                <Heading as='h1' variant='heading10'>Verificação de Segurança</Heading>
                <Heading as='h3' variant='heading30'>
                  Perguntas de verificação respondidas com sucesso.
                </Heading>
                <Button 
                  variant="primary"
                  id={`btn_unblock_card`}
                  onClick={e => this.unblockCard(customerData.userId, e)}
                  loading={unblockingCard}
                >
                  Desbloquear Cartão
                </Button>
              </Box>
            </Theme.Provider>
          )
        }
      } else {
        // const { securityQuestions } = task.attributes.customerData
        // console.log('LOG => Loading sec questions for task', task.taskSid, securityQuestions)
        // this.setState({ securityQuestions, loadedSecurityQuestions: true, cardStatus: 'BLOCKED' })
        return null
      }
    } else {
      return null
    }
  }
}

export default withTaskContext(SecurityCheck)
