import { Html, Head, Main, NextScript } from 'next/document'

export default function Document () {
  const description = 'Instituto Pascal AI assistant - Powered by OpenAI'
  const sitename = 'institutopascal.ai'
  const title = 'Instituto Pascal AI assistant'
  const ogimage = 'https://www.institutopascal.ai/og-image.png'
  return (
    <Html lang="es" className='bg-clippy h-full'>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={description} />
        <meta property="og:site_name" content={sitename} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={title} />
        <meta name="twitter:card" content="pascal_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogimage} />
        <meta property="og:image" content={ogimage} />
        <link href="https://unpkg.com/pattern.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
