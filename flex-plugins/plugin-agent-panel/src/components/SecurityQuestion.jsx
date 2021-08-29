import { Component } from 'react'
import { Box, Button, Label, Input } from '@twilio-paste/core'
import { Actions, withTaskContext } from '@twilio/flex-ui'
import axios from 'axios'

class SecurityQuestion extends Component {
  constructor(props) {
    super(props)
    console.log('LOG => SECURITY QUESTION RENDERED ')
    this.state = {
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
    const { answer, serviceUrl } = this.state
    const { userId, question } = this.props

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
          console.log('LOG => ANSWER CHECK RESULT =>', result, task)

          if (result === 'CORRECT') {
            Actions.invokeAction('securityQuestionAnswered', question.id)
          }
        }
      })
    }
  }

  render() {
    const { checkingAnswer, answer } = this.state
    const { question } = this.props
    console.log('LOG => RENDERING SEC QUESTION', question)

    return (
      <Box marginBottom='space40'>
        <Label required>{question.label}</Label>
        <Input
          id={question.id}
          name={question.id}
          type='text'
          defaultValue=''
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
  }
}

export default withTaskContext(SecurityQuestion)
