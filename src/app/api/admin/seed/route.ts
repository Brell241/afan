import { spawn } from 'child_process';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Forbidden', { status: 403 });
  }

  const { slug } = await request.json() as { slug: string };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      const proc = spawn('npx', ['tsx', `src/seed/${slug}.ts`], {
        cwd: process.cwd(),
        env: { ...process.env },
      });

      const pushLines = (chunk: Buffer) =>
        chunk.toString().split('\n').filter(Boolean).forEach(text =>
          send({ type: 'log', text })
        );

      proc.stdout.on('data', pushLines);
      proc.stderr.on('data', pushLines);

      proc.on('close', (code) => {
        send({ type: 'done', success: code === 0 });
        controller.close();
      });

      proc.on('error', (err) => {
        send({ type: 'error', text: err.message });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
