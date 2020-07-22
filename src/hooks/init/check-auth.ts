import { Hook } from '@oclif/config'
import * as chalk from 'chalk'
import { error } from './../../services/message.service'

import {
  hasAccessToken,
  isUsingCustomBucket,
} from './../../services/config.service'

const hook: Hook<'init'> = async function (opts) {
  const commandsToCheck = [
    'gif',
    'g',
    'image',
    'img',
    'i',
    'screenshot',
    'video',
    'vid',
    'm',
  ]

  if (opts.id && commandsToCheck.includes(opts.id)) {
    const isLoggedIn = await hasAccessToken()
    const hasCustomBucket = await isUsingCustomBucket()

    if (!isLoggedIn && !hasCustomBucket) {
      error(`👩🏽‍💻 Please login first -> ${chalk.yellow('tape login')}`)
    }
  }
}

export default hook
