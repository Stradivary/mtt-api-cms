import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DATA_PATH = path.join(process.cwd(), 'news.json');

async function readNewsData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id;
  const news = await readNewsData();
  const item = news.find((n: any) => n.id === id);

  return item
    ? NextResponse.json(item)
    : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id;
  const news = await readNewsData();
  const newNews = news.filter((n: any) => n.id !== id);

  if (news.length === newNews.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(newNews, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id;
  const formData = await req.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const file = formData.get('image') as File;

  const news = await readNewsData();
  const index = news.findIndex((n: any) => n.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let imageUrl = news[index].image;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    imageUrl = `/uploads/${filename}`;
  }

  news[index] = { ...news[index], title, content, image: imageUrl };
  await fs.writeFile(DATA_PATH, JSON.stringify(news, null, 2), 'utf8');
  return NextResponse.json(news[index]);
}
