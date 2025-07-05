import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result: { picks: number; box: number }[] = [];

    const dataBytes = buffer.subarray(16); // Skip header
    for (let i = 0; i < dataBytes.length; i += 2) {
      const byte1 = dataBytes[i];
      const byte2 = dataBytes[i + 1];
      if (byte1 === 0xff && byte2 === 0xff) break;
      result.push({ picks: byte1, box: byte2 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
