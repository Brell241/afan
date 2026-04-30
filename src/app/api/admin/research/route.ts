import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Forbidden', { status: 403 });
  }

  const { artistName, slug, options } = await request.json() as {
    artistName: string;
    slug: string;
    options: {
      ytChannel?: string | null;
      images?: boolean;
      cloudinary?: boolean;
      deepseek?: boolean;
      noYoutube?: boolean;
    };
  };

  const args = ['-u', 'scripts/research_seed.py', artistName, slug];
  if (options?.ytChannel)  args.push('--yt-channel', options.ytChannel);
  if (options?.images)     args.push('--images');
  if (options?.cloudinary) args.push('--cloudinary');
  if (options?.deepseek)   args.push('--deepseek');
  if (options?.noYoutube)  args.push('--no-youtube');

  const encoder = new TextEncoder();
  const cwd = process.cwd();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      const proc = spawn('python3', args, { cwd, env: { ...process.env } });

      const pushLines = (chunk: Buffer, isErr = false) =>
        chunk.toString().split('\n').filter(Boolean).forEach(text =>
          send({ type: 'log', text, isErr })
        );

      proc.stdout.on('data', (c) => pushLines(c));
      proc.stderr.on('data', (c) => pushLines(c, true));

      proc.on('close', (code) => {
        if (code === 0) {
          const jsonPath = path.join(cwd, 'src', 'seed', `${slug}.json`);
          let preview = null;
          try {
            if (fs.existsSync(jsonPath))
              preview = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          } catch {}
          send({ type: 'done', success: true, preview });
        } else {
          send({ type: 'done', success: false });
        }
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
