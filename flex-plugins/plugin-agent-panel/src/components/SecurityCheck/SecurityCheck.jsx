import React from 'react'

import { SecurityCheckComponentStyles } from './SecurityCheck.Styles'

// It is recommended to keep components stateless and use redux for managing states
const SecurityCheck = (props) => {
  if (!props.isOpen) {
    return null
  }

  return (
    <SecurityCheckComponentStyles>
      This is a dismissible demo component
      <i className="accented" onClick={props.dismissBar}>
        close
      </i>
    </SecurityCheckComponentStyles>
  )
}

export default SecurityCheck
