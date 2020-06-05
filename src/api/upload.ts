import axios from 'axios'
import { isEmpty } from 'lodash'

import { ConfigService } from '../services'
import { TAPE_HOST } from '../services/config.service'

// Generated by https://quicktype.io
interface CreateTapeResponse {
  data: Data
}

interface Data {
  createTape: CreateTape
}

interface CreateTape {
  url: string
  tapeUrl: string
  id?: string
}

export const generateSignedUploadURL = async (
  fileName: string,
  contentType: string
) => {
  const accessToken = await ConfigService.get('token')

  if (isEmpty(accessToken)) {
    throw new Error('Please login, run: tape login or tape config')
  }

  const { data } = await axios.post<CreateTapeResponse>(
    `${TAPE_HOST}/.netlify/functions/graphql`,
    {
      query: `mutation createTape($fileName: String!, $contentType: String) {
      createTape(input: {
        fileName: $fileName
        contentType: $contentType
      }) {
        url
        tapeUrl
      }
    }`,
      operationName: 'createTape',
      variables: { fileName, contentType },
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'auth-provider': 'cli',
      },
    }
  )

  return data.data.createTape
}

export const putFile = async (
  file: Buffer,
  signedUrl: string,
  headers: object
) => {
  return axios.put(signedUrl, file, {
    headers,
  })
}
