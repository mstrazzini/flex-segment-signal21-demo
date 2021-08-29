import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Actions } from '../../states/SecurityCheckState'
import SecurityCheck from './SecurityCheck'

const mapStateToProps = (state) => ({
    securityQuestionsMap: state['security-check'].securityQuestionsMap,
})

const mapDispatchToProps = (dispatch) => ({
  updateSecurityQuestions: bindActionCreators(Actions.updateSecurityQuestions, dispatch),
  completeSecurityQuestion: bindActionCreators(Actions.completeSecurityQuestion, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(SecurityCheck)
