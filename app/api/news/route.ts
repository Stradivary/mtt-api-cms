import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

const DATA_PATH = path.join(process.cwd(), 'news.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const news = JSON.parse(raw);
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File;

    if (!title || !content || !imageFile) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    await ensureUploadDir();

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    await writeFile(filePath, buffer);

    let news = [];
    try {
      const raw = await fs.readFile(DATA_PATH, 'utf8');
      news = JSON.parse(raw);
    } catch {}

    const newItem = {
      id: Date.now().toString(),
      title,
      content,
      image: `/uploads/${fileName}`,
      createdAt: new Date().toISOString(),
    };

    news.push(newItem);
    await fs.writeFile(DATA_PATH, JSON.stringify(news, null, 2), 'utf8');

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
