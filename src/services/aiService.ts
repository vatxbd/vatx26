import { parseRobustJson } from '../utils/robustJsonParser';

export interface TaxUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'tax' | 'vat';
  impact: 'low' | 'medium' | 'high';
}

export const generateLawUpdates = async (language: 'en' | 'bn'): Promise<TaxUpdate[]> => {
  const prompt = `Generate 3 recent or simulated updates regarding Bangladesh NBR Tax and VAT laws for the year 2024-25. 
  The updates should be professional and relevant to businesses/individuals in Bangladesh.
  Language: ${language === 'bn' ? 'Bengali (Bangla)' : 'English'}.
  Return as a JSON array of objects with id, title, content, date (YYYY-MM-DD), type ('tax' or 'vat'), and impact ('low', 'medium', or 'high').`;

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              content: { type: "string" },
              date: { type: "string" },
              type: { type: "string", enum: ['tax', 'vat'] },
              impact: { type: "string", enum: ['low', 'medium', 'high'] }
            },
            required: ['id', 'title', 'content', 'date', 'type', 'impact']
          }
        }
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return parseRobustJson<TaxUpdate[]>(data.text || '[]', []);
  } catch (err) {
    console.error("Failed to generate law updates:", err);
    return [];
  }
};

export const generateSocialPost = async (update: TaxUpdate, platform: 'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'instagram' | 'threads'): Promise<string> => {
  const prompt = `Create a social media post for ${platform} based on this tax/VAT law update from Bangladesh NBR:
  Update Title: ${update.title}
  Update Content: ${update.content}
  Language: Bengali (Bangla).
  The post should be engaging, informative, and include relevant emojis and hashtags tailored for ${platform}.
  ${platform === 'twitter' ? 'Maximum 280 characters.' : ''}
  ${platform === 'instagram' ? 'Focus on visual tone and hashtags.' : ''}
  Output ONLY the post text.`;

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.text || '';
  } catch (err) {
    console.error("Failed to generate social post:", err);
    return '';
  }
};
