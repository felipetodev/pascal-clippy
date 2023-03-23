import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval
} from 'eventsource-parser'
import { codeBlock, oneLine } from 'common-tags'
import type { CreateCompletionRequest } from 'openai'
import { ApplicationError } from './errors'
import { type PDFchunk } from '@/types'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

export async function OpenAIStream (chunks: PDFchunk[], query: string) {
  try {
    const contextText = chunks.map(({ content }) => content.trim()).join('\n---\n')

    const prompt = codeBlock`
      ${oneLine`
        You are a very enthusiastic Instituto Pascal representative who loves
        to help people! Given the following sections from the college
        normative, answer the question using only that information,
        outputted in markdown format. If you are unsure and the answer
        is not explicitly written in the normative document, say
        "Sorry, I don't know how to help with that."
      `}

      Context sections:
      ${contextText}

      Question: """
      ${query}
      """

      Answer as markdown:
    `

    const completionOptions: CreateCompletionRequest = {
      model: 'text-davinci-003', // gpt-3.5-turbo
      prompt,
      max_tokens: 512,
      temperature: 0,
      stream: true
    }

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`
      },
      body: JSON.stringify(completionOptions)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new ApplicationError('Failed to generate completion', error)
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    let counter = 0

    const stream = new ReadableStream({
      async start (controller) {
        function onParse (event: ParsedEvent | ReconnectInterval) {
          if (event.type === 'event') {
            const data = event.data
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const text = json.choices[0].text // json.choices[0].delta.content
              if (counter < 2 && (text.match(/\n/) || []).length) {
                // this is a prefix character (i.e., "\n\n"), do nothing
                return
              }
              const queue = encoder.encode(text)
              controller.enqueue(queue)
              counter++
            } catch (e) {
              // maybe parse error
              controller.error(e)
            }
          }
        }
        const parser = createParser(onParse)
        for await (const chunk of response.body as any) {
          parser.feed(decoder.decode(chunk))
        }
      }
    })

    return stream
  } catch (err: unknown) {
    console.error(err)
  }
}
