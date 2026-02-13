
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  category: string;
  image?: string;
  content: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  // Ensure directory exists
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        content,
        title: data.title || 'Sem título',
        date: data.date || new Date().toISOString(),
        description: data.description || '',
        category: data.category || 'Geral',
        image: data.image || `https://picsum.photos/seed/${slug}/800/450`,
      } as BlogPost;
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) return null;
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      content,
      title: data.title || 'Sem título',
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      category: data.category || 'Geral',
      image: data.image || `https://picsum.photos/seed/${slug}/800/450`,
    } as BlogPost;
  } catch (e) {
    return null;
  }
}
