type RtspClientSet = Set<Bun.ServerWebSocket<{ upgrade: true }>>;

const rtspClientSets: Record<string, RtspClientSet> = {};

export function addRtspClientTo(camKey: string, ws: Bun.ServerWebSocket<{ upgrade: true }>) {
  if (!rtspClientSets[camKey]) rtspClientSets[camKey] = new Set();
  rtspClientSets[camKey].add(ws);
}

export function removeRtspClientFrom(camKey: string, ws: Bun.ServerWebSocket<{ upgrade: true }>) {
  rtspClientSets[camKey]?.delete(ws);
}

export function startRtspStreamFor(camKey: string, rtspUrl: string) {
  if (!rtspClientSets[camKey]) rtspClientSets[camKey] = new Set();

  const ffmpeg = Bun.spawn([
    "ffmpeg",
    "-rtsp_transport", "tcp",
    "-i", rtspUrl,
    "-f", "mjpeg",
    "-q:v", "5",
    "pipe:1"
  ], {
    stdout: "pipe",
    stderr: "ignore"
  });

  let buffer = Buffer.alloc(0);

  async function readStream() {
    const reader = ffmpeg.stdout.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer = Buffer.concat([buffer, Buffer.from(value)]);
          let start = buffer.indexOf(Buffer.from([0xFF, 0xD8]));
          let end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start + 2);
          while (start !== -1 && end !== -1) {
            const frame = buffer.slice(start, end + 2);
            for (const ws of rtspClientSets[camKey]) {
              if (ws.readyState === 1) ws.send(frame);
            }
            buffer = buffer.slice(end + 2);
            start = buffer.indexOf(Buffer.from([0xFF, 0xD8]));
            end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start + 2);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  readStream();

  ffmpeg.exited.then(() => {
    setTimeout(() => startRtspStreamFor(camKey, rtspUrl), 1000);
  });
}