import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as chalk from 'chalk'
import * as commandExists from 'command-exists'
import * as adb from 'adbkit'

import { isMac, isWindows } from '../helpers/utils'
import { omit, isEmpty } from 'lodash'
import { error, log } from './message.service'

type ConfigKey = 'bucketName' | 'device' | 'token' | 'emojisDisabled'

export const TAPE_HOST = process.env.TAPE_DEBUG_HOST || 'https://tape.sh'
export const DIR = path.join(os.homedir(), '.tape')
export const BIN_DIR = path.join(DIR, 'bin')
export const FILE = path.join(os.homedir(), '.tape', 'config.json')

const setupConfigFile = () => {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR)
  }


  const defaultConfig = {
    emojisDisabled: isWindows(),
  }

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify(defaultConfig))
  }
}

const read = async () => {
  setupConfigFile()
  const raw = await fs.readFileSync(FILE, 'utf8')
  return JSON.parse(raw)
}

const get = async (key: ConfigKey) => {
  setupConfigFile()
  const config = await read()
  return config[key]
}

const set = async (key: ConfigKey, value: string | object | null) => {
  setupConfigFile()
  const config = await read()
  const newConfig = { ...config, [key]: value }

  if (isEmpty(value)) {
    omit(newConfig, key)
  }

  fs.writeFileSync(FILE, JSON.stringify(newConfig))
}

export const checkDependencies = async () => {
  // Check if config is writable
  fs.access(os.homedir(), fs.constants.W_OK, (err) => {
    if (err) {
      console.error(
        `   Tape Setup -> ${chalk.red(
          '🤦 Need permissions to write to'
        )} ${DIR}`
      )
    }

    log('   Tape Config Writable ✅')
  })

  // Check for adb
  try {
    const adbClient = adb.createClient()
    await adbClient.listDevices()
    log('   Android Setup ✅')
    // eslint-disable-next-line unicorn/catch-error-name
  } catch (e) {
    error(
      `   Android Setup -> ${chalk.red('🤦🏻‍♂️ Could not locate android sdk')}`
    )
    log(
      `     ℹ  To install the android sdk ${chalk.blue(
        'Visit https://developer.android.com/studio or brew cask install android-sdk'
      )}`
    )
  }

  // Check for xcrun
  if (isMac()) {
    try {
      await commandExists('xcrun')
      log('   iOS Setup ✅')
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (e) {
      error(`   iOS Setup -> ${chalk.red('🤦🏽‍♀️ Could not find xcrun.')}`)
      log(
        `     ℹ  You can install it by running:  ${chalk.blue(
          'xcode-select --install'
        )}`
      )
    }
  }
}

export const hasAccessToken = async () => {
  const token = await get('token')

  return !isEmpty(token)
}

export const isUsingCustomBucket = async () => {
  const bucketName = await get('bucketName')

  return !isEmpty(bucketName)
}

export const adbAvailable = () => commandExists.sync('adb')

export default { get, set }
