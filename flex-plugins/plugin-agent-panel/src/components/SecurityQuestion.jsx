import { Component } from 'react'
import { Box, Button, Label, Input } from '@twilio-paste/core'
import { withTaskContext } from '@twilio/flex-ui'
import axios from 'axios'

class SecurityQuestion extends Component {
  constructor(props) {
    super(props)
    console.log('LOG => SECURITY QUESTION RENDERED ')
    this.state = {
      userId: this.props.userId,
      question: this.props.question,
      checkingAnswer: false,
      serviceUrl: 'https://serverless-9217-dev.twil.io/answer-security-question'
    }
    this.updateAnswer = this.updateAnswer.bind(this)
    this.checkAnswer = this.checkAnswer.bind(this)
  }

  updateAnswer(event) {
    this.setState({ answer: event.target.value || ''})
  }

  async checkAnswer(event) {
    console.log('LOG => CLICKED =>', this.state)
    const { userId, question, answer, serviceUrl } = this.state

    if (answer) {
      this.setState({ checkingAnswer: true })
      await axios.post(serviceUrl, {
        userId,
        questionId: question.id,
        answer
      }).then(response => {
        this.setState({ checkingAnswer: false })
        if (response.error) {
          console.error(response.error)
        } else {
          const result = response.data
          const { task } = this.props
          const { customerData } = task.attributes
          console.log('LOG => ANSWER CHECK RESULT =>', result, task)

          if (result === 'CORRECT') {
            this.setState({ question: {
              status: 'ANSWERED'
            }})
            const { attributes } = task
            attributes.customerData.securityQuestions = customerData.securityQuestions.filter(i => i.id !== question.id)

            console.log('LOG => UPDATED TASK ATTRIBUTES', attributes) 

            task.setAttributes(attributes)
            console.log('LOG => TASK FROM QUESTION =>', task)
          }
        }
      })
    }
  }

  render() {
    console.log('LOG => STATE =>', this.state)
    const { question, checkingAnswer, answer } = this.state
    const { task } = this.props

    if (question.status === 'PENDING') {
      return (
        <Box marginBottom='space40'>
          <Label required>{question.label}</Label>
          <Input
            id={question.id}
            name={question.id}
            type='text'
            onChange={this.updateAnswer}
            insertAfter={
              <Button 
                variant="secondary"
                id={`btn_${question.id}`}
                onClick={this.checkAnswer}
                loading={checkingAnswer}
                disabled={!answer}
              >
                Check
              </Button>
            }
          />
        </Box>
      )
    } else {
      return null
    }
  }
}

export default withTaskContext(SecurityQuestion)
