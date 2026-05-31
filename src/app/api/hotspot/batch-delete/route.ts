import { NextRequest } from 'next/server'
import { rosCmd, rosCmdWithProgress, isMacAddress, resolveMacToIp } from '@/lib/mikrotik'
import { parseCreds } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = parseCreds(body)
  if ('error' in result) return result.error

  const { creds } = result
  const { codes }: { codes: string[] } = body

  if (!Array.isArray(codes) || codes.length === 0)
    return Response.json({ error: 'No codes provided' }, { status: 400 })

  const enc = new TextEncoder()
  const send = (data: object) => enc.encode(`data: ${JSON.stringify(data)}\n\n`)

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const resolvedHost = isMacAddress(creds.host) ? await resolveMacToIp(creds.host) : creds.host

        // Step 1 — find matching user IDs
        controller.enqueue(send({ stage: 'lookup', progress: 0, total: codes.length }))

        const listResult = await rosCmd(resolvedHost, creds.port, creds.username, creds.password, [
          ['/ip/hotspot/user/print'],
        ])

        const codeSet = new Set(codes)
        const matchedIds = listResult[0]
          .filter((r) => r.type === '!re' && codeSet.has(r.attrs['name']))
          .map((r) => r.attrs['.id'])
          .filter(Boolean) as string[]

        if (matchedIds.length === 0) {
          controller.enqueue(send({ done: true, deleted: 0, notFound: codes.length }))
          controller.close()
          return
        }

        // Step 2 — delete with progress
        controller.enqueue(send({ stage: 'deleting', progress: 0, total: matchedIds.length }))

        const deleteCommands = matchedIds.map((id) => ['/ip/hotspot/user/remove', `=.id=${id}`])

        await rosCmdWithProgress(
          resolvedHost,
          creds.port,
          creds.username,
          creds.password,
          deleteCommands,
          (done, total) => controller.enqueue(send({ stage: 'deleting', progress: done, total }))
        )

        controller.enqueue(send({ done: true, deleted: matchedIds.length, notFound: codes.length - matchedIds.length }))
        controller.close()
      } catch (err) {
        controller.enqueue(send({ error: (err as Error).message }))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
