import React from 'react'
import { VERSION } from '@twilio/flex-ui'
import { FlexPlugin } from 'flex-plugin'

import SecurityCheckContainer from './components/SecurityCheck/SecurityCheck.Container'
import reducers, { namespace } from './states'

const PLUGIN_NAME = 'SecurityCheckPlugin'

export default class SecurityCheckPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME)
  }

  init(flex, manager) {
    this.registerReducers(manager)

    console.log('LOG => blablabla')

    flex.AgentDesktopView.Panel2.Content
      .replace(<SecurityCheckContainer key='sec-check' />)
  }

  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`)
      return
    }

    manager.store.addReducer(namespace, reducers)
  }
}
