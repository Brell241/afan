import { NextRequest, NextResponse } from 'next/server';

type PolishType = 'context' | 'lyrics_fr' | 'lyrics_original';

const PROMPTS: Record<PolishType, string> = {
  context:
    "Tu es un rédacteur culturel spécialisé dans la musique africaine. Tu reçois un texte brut décrivant le contexte ou l'histoire d'un titre musical gabonais. Réécris-le de façon professionnelle, fluide et engageante — comme pour une notice encyclopédique ou un livret de disque haut de gamme. Reste factuel, concis, et conserve tous les faits. Réponds uniquement avec le texte réécrit, sans introduction ni commentaire.",
  lyrics_fr:
    "Tu es un traducteur et adaptateur de paroles de musique africaine. Tu reçois une traduction brute de paroles en langue fang vers le français. Fluidifie et embellis cette traduction pour qu'elle soit naturelle, poétique et fidèle au sens original. Conserve les retours à la ligne et la structure en couplets. Réponds uniquement avec le texte embelli, sans introduction ni commentaire.",
  lyrics_original:
    "Tu es un éditeur de textes musicaux. Tu reçois des paroles brutes en langue fang. Mets-les en forme proprement : corrige la ponctuation, uniformise la casse, et aère la présentation en conservant la structure en couplets. Ne traduis pas. Réponds uniquement avec le texte mis en forme, sans introduction ni commentaire.",
};

export async function POST(req: NextRequest) {
  const { text, type } = await req.json() as { text: string; type: PolishType };

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Texte manquant' }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Clé API DeepSeek non configurée' }, { status: 500 });
  }

  const systemPrompt = PROMPTS[type] ?? PROMPTS.context;

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.65,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('DeepSeek error:', err);
    return NextResponse.json({ error: 'Erreur DeepSeek' }, { status: 502 });
  }

  const data = await res.json();
  const result: string = data.choices?.[0]?.message?.content ?? '';
  return NextResponse.json({ result });
}
