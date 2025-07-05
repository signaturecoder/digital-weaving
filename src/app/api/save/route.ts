import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Construct .DB0 header: 16 bytes (8 for "vip", 8 zero-padded)
    const header = Buffer.alloc(16, 0);
    header.write('vip');

    // Convert each entry into [picks, box] 2-byte pair
    const rows = data.map((entry: any) => {
      const picks = Math.max(0, Math.min(255, Number(entry.picks) || 0));
      const box = Math.max(0, Math.min(255, Number(entry.box) || 0));
      return Buffer.from([picks, box]);
    });

    // Footer padding to mimic original file’s trailing FFs
    const footer = Buffer.alloc(64, 0xff);

    const finalBuffer = Buffer.concat([header, ...rows, footer]);

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="VIP.DB0"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
