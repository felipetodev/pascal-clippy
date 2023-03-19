import Head from 'next/head'

export default function Home () {
  return (
    <>
      <Head>
        <title>Clippy Pascal</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="text-3xl font-bold underline text-blue-600">
          Hello Clippy!
        </h1>
      </main>
    </>
  )
}
