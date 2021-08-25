import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Actions } from '../../states/SecurityCheckState'
import SecurityCheck from './SecurityCheck'

const mapStateToProps = (state) => ({
    isOpen: state['security-check'].securityCheck.isOpen,
})

const mapDispatchToProps = (dispatch) => ({
  dismissBar: bindActionCreators(Actions.dismissBar, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(SecurityCheck)
