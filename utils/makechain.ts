import { OpenAIChat } from 'langchain/llms'
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains'
import { type SupabaseVectorStore } from 'langchain/vectorstores'
import { PromptTemplate } from 'langchain/prompts'
import { CallbackManager } from 'langchain/callbacks'

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`)

const QA_PROMPT = PromptTemplate.fromTemplate(
  `You are a very enthusiastic Instituto Pascal representative who loves
  to help people! Given the following sections from the college
  normative, answer the question using only that information,
  outputted in markdown format. If you are unsure and the answer
  is not explicitly written in the normative document, say
  "Perdón, no tengo información para ayudarte con eso.":

Question: {question}
=========
{context}
=========
Answer as markdown:`
)

export const makeChain = (
  vectorstore: SupabaseVectorStore,
  onTokenStream?: (token: string) => void
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAIChat({ temperature: 0 }),
    prompt: CONDENSE_PROMPT
  })
  const docChain = loadQAChain(
    new OpenAIChat({
      temperature: 0,
      modelName: 'gpt-3.5-turbo', // gpt-4
      streaming: Boolean(onTokenStream),
      callbackManager: onTokenStream
        ? CallbackManager.fromHandlers({
          async handleLLMNewToken (token: string) {
            onTokenStream(token)
            console.log(token)
          }
        })
        : undefined
    }),
    { prompt: QA_PROMPT }
  )

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator
    // k: 5
  })
}
