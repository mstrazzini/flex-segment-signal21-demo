import { combineReducers } from 'redux'

import { reduce as SecurityCheckReducer } from './SecurityCheckState'

// Register your redux store under a unique namespace
export const namespace = 'security-check'

// Combine the reducers
export default combineReducers({
  securityCheck: SecurityCheckReducer
})
