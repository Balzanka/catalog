import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google Gemini SDK on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Direct Wikipedia API search endpoint (for Books & Music)
app.get('/api/wikipedia-lookup', async (req, res) => {
  const query = req.query.q as string;
  const lang = (req.query.lang as string) || 'sk';
  if (!query) {
    return res.status(400).json({ error: 'Chýba parameter vyhľadávania' });
  }

  try {
    // Search for closest title
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`;
    const searchResp = await fetch(searchUrl, {
      headers: { 'User-Agent': 'MyCatalogApp/1.0 (catalog@example.com)' }
    });
    const searchData = await searchResp.json();
    
    if (searchData && searchData[1] && searchData[1].length > 0) {
      const pageTitle = searchData[1][0];
      const pageUrl = searchData[3][0];
      
      // Fetch summary from REST API
      const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
      const summaryResp = await fetch(summaryUrl, {
        headers: { 'User-Agent': 'MyCatalogApp/1.0 (catalog@example.com)' }
      });
      if (summaryResp.ok) {
        const summary = await summaryResp.json();
        return res.json({
          title: summary.title || pageTitle,
          description: summary.extract || '',
          coverUrl: summary.thumbnail ? summary.thumbnail.source : undefined,
          wikipediaUrl: pageUrl || summary.content_urls?.desktop?.page,
          sourceName: `Wikipédia (${lang.toUpperCase()})`
        });
      }
    }
    
    // If not found in SK, fallback to EN if queried SK
    if (lang === 'sk') {
      const enSearchResp = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`, {
        headers: { 'User-Agent': 'MyCatalogApp/1.0 (catalog@example.com)' }
      });
      const enData = await enSearchResp.json();
      if (enData && enData[1] && enData[1].length > 0) {
        const enTitle = enData[1][0];
        const enUrl = enData[3][0];
        const enSummaryResp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(enTitle)}`, {
          headers: { 'User-Agent': 'MyCatalogApp/1.0 (catalog@example.com)' }
        });
        if (enSummaryResp.ok) {
          const summary = await enSummaryResp.json();
          return res.json({
            title: summary.title || enTitle,
            description: summary.extract || '',
            coverUrl: summary.thumbnail ? summary.thumbnail.source : undefined,
            wikipediaUrl: enUrl || summary.content_urls?.desktop?.page,
            sourceName: 'Wikipedia (EN)'
          });
        }
      }
    }

    return res.json({
      title: query,
      wikipediaUrl: `https://${lang}.wikipedia.org/wiki/Špeciálne:Hľadanie?search=${encodeURIComponent(query)}`,
      sourceName: 'Wikipédia'
    });
  } catch (err: any) {
    console.error('Wikipedia lookup error:', err);
    return res.status(500).json({ error: 'Chyba pri hľadaní na Wikipédii' });
  }
});

// 2. Direct Steam Store search API endpoint (for Games)
app.get('/api/steam-lookup', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Chýba názov hry' });
  }

  try {
    const steamApiUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=SK`;
    const resp = await fetch(steamApiUrl);
    if (!resp.ok) {
      throw new Error(`Steam API responded with ${resp.status}`);
    }
    const data = await resp.json();
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const appId = String(item.id);
      
      // Construct Steam header and store link
      const steamUrl = `https://store.steampowered.com/app/${appId}/`;
      const coverUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
      
      return res.json({
        title: item.name,
        steamAppId: appId,
        steamUrl: steamUrl,
        coverUrl: coverUrl,
        price: item.price ? `${(item.price.final / 100).toFixed(2)} €` : 'Neznáma',
        platforms: item.platforms ? Object.keys(item.platforms).filter(p => item.platforms[p]).join(', ') : 'PC (Steam)',
        sourceName: 'Steam Store'
      });
    }

    return res.json({
      title: query,
      steamUrl: `https://store.steampowered.com/search/?term=${encodeURIComponent(query)}`,
      sourceName: 'Steam'
    });
  } catch (err: any) {
    console.error('Steam lookup error:', err);
    return res.status(500).json({ error: 'Chyba pri hľadaní na Steame' });
  }
});

// 3. Smart catalog enrichment lookup using Gemini with source priority
app.post('/api/lookup', async (req, res) => {
  const { query, category } = req.body;
  if (!query || !category) {
    return res.status(400).json({ error: 'Chýba názov alebo kategória' });
  }

  const cleanQuery = String(query).trim();

  // If Gemini is configured, use Gemini 3.8 Flash to synthesize rich metadata in Slovak
  if (aiClient) {
    try {
      let promptInstruction = '';
      if (category === 'movies' || category === 'tv_series') {
        promptInstruction = `The user is looking up a ${category === 'movies' ? 'film/movie' : 'TV series'} titled "${cleanQuery}".
You MUST simulate and provide information corresponding to ČSFD.cz (Česko-Slovenská filmová databáze) and IMDb.com.
Provide:
- title: standard Slovak or Czech title if known, else original
- originalTitle: original title
- creatorOrAuthor: Director (Réžia)
- releaseYear: year (number or string)
- genres: array of genre strings in Slovak (napr. Dráma, Sci-Fi, Komédia, Akčný)
- description: concise, engaging plot summary in natural Slovak (2-4 sentences)
- csfdRating: realistic average rating in percentage (napr. "86%")
- csfdUrl: ČSFD search/entry URL, e.g. "https://www.csfd.cz/hladat/?q=${encodeURIComponent(cleanQuery)}"
- imdbRating: IMDb rating out of 10 (napr. "8.8")
- imdbUrl: IMDb search/entry URL, e.g. "https://www.imdb.com/find/?q=${encodeURIComponent(cleanQuery)}"
- durationOrPages: length in minutes (e.g. "148 min" or "5 sérií, 62 epizód")
- castOrTracklist: top 3-5 main actors (Herci)
- coverUrl: poster URL if known or valid high-quality placeholder image`;
      } else if (category === 'music' || category === 'books') {
        promptInstruction = `The user is looking up ${category === 'music' ? 'music (artist/album/song)' : 'a book'} titled "${cleanQuery}".
You MUST simulate and provide information corresponding to Wikipedia (sk.wikipedia.org / en.wikipedia.org).
Provide:
- title: album or book title
- originalTitle: original title if different
- creatorOrAuthor: Artist/Band/Composer or Book Author
- releaseYear: year of release
- genres: array of genres in Slovak
- description: encyclopedic summary in natural Slovak from Wikipedia perspective
- wikipediaUrl: relevant Wikipedia link (prefer "https://sk.wikipedia.org/wiki/Špeciálne:Hľadanie?search=${encodeURIComponent(cleanQuery)}" or en.wikipedia.org)
- publisherOrLabel: record label or book publishing house
- durationOrPages: duration of album or number of pages of book
- castOrTracklist: 3-5 notable tracks or chapters/characters`;
      } else if (category === 'games') {
        promptInstruction = `The user is looking up a video game titled "${cleanQuery}".
You MUST simulate and provide information corresponding to the Steam Store (store.steampowered.com).
Provide:
- title: game title as on Steam
- creatorOrAuthor: Developer / Publisher studio
- releaseYear: release year
- genres: Steam tags and genres (napr. RPG, Akčné, Otvorený svet, Pre viacerých hráčov)
- description: game synopsis and key features in natural Slovak
- steamUrl: "https://store.steampowered.com/search/?term=${encodeURIComponent(cleanQuery)}"
- steamRating: Steam review consensus (napr. "Veľmi kladné (92%)" or "Mimoriadne kladné")
- platformOrFormat: platforms (napr. "PC (Steam), Steam Deck")
- durationOrPages: estimated average playtime (napr. "35 hodín")`;
      } else {
        promptInstruction = `The user wants a template or structure for a note titled "${cleanQuery}". Provide description and suggested tags.`;
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptInstruction,
        config: {
          systemInstruction: 'You are an expert Slovak catalog librarian specializing in metadata lookup for movies, TV series (ČSFD.cz & IMDb), music, books (Wikipedia), games (Steam), and notes. Always reply with clean valid JSON conforming to the schema. Output natural, grammatically correct Slovak.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              originalTitle: { type: Type.STRING },
              creatorOrAuthor: { type: Type.STRING },
              releaseYear: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              csfdUrl: { type: Type.STRING },
              csfdRating: { type: Type.STRING },
              imdbUrl: { type: Type.STRING },
              imdbRating: { type: Type.STRING },
              wikipediaUrl: { type: Type.STRING },
              steamUrl: { type: Type.STRING },
              steamRating: { type: Type.STRING },
              publisherOrLabel: { type: Type.STRING },
              durationOrPages: { type: Type.STRING },
              platformOrFormat: { type: Type.STRING },
              castOrTracklist: { type: Type.ARRAY, items: { type: Type.STRING } },
              coverUrl: { type: Type.STRING }
            },
            required: ['title', 'description']
          }
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);

        // Guarantee accurate deep search URLs according to requirements
        if (category === 'movies' || category === 'tv_series') {
          if (!parsed.csfdUrl || !parsed.csfdUrl.startsWith('http')) {
            parsed.csfdUrl = `https://www.csfd.cz/hladat/?q=${encodeURIComponent(cleanQuery)}`;
          }
          if (!parsed.imdbUrl || !parsed.imdbUrl.startsWith('http')) {
            parsed.imdbUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(cleanQuery)}`;
          }
        } else if (category === 'music' || category === 'books') {
          if (!parsed.wikipediaUrl || !parsed.wikipediaUrl.startsWith('http') || parsed.wikipediaUrl.length > 150) {
            parsed.wikipediaUrl = `https://sk.wikipedia.org/wiki/Špeciálne:Hľadanie?search=${encodeURIComponent(cleanQuery)}`;
          }
        } else if (category === 'games') {
          if (!parsed.steamUrl || !parsed.steamUrl.startsWith('http') || parsed.steamUrl.length > 150) {
            parsed.steamUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(cleanQuery)}`;
          }
          // If no cover, try to fetch real steam header
          if (!parsed.coverUrl) {
            try {
              const steamApiUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanQuery)}&l=english&cc=SK`;
              const resp = await fetch(steamApiUrl);
              if (resp.ok) {
                const sData = await resp.json();
                if (sData.items && sData.items.length > 0) {
                  const sItem = sData.items[0];
                  parsed.coverUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${sItem.id}/header.jpg`;
                  parsed.steamAppId = String(sItem.id);
                  parsed.steamUrl = `https://store.steampowered.com/app/${sItem.id}/`;
                }
              }
            } catch (err) {
              // Ignore
            }
          }
        }

        return res.json({
          ...parsed,
          category,
          sourceName: category === 'movies' || category === 'tv_series' 
            ? 'ČSFD.cz & IMDb.com' 
            : category === 'music' || category === 'books'
            ? 'Wikipédia'
            : 'Steam Store'
        });
      }
    } catch (aiErr) {
      console.error('Gemini lookup fallback needed:', aiErr);
    }
  }

  // Graceful fallback with direct queries and links according to requirements
  const fallbackResponse: any = {
    title: cleanQuery,
    category,
    sourceName: 'Priamy odkaz'
  };

  if (category === 'movies' || category === 'tv_series') {
    fallbackResponse.csfdUrl = `https://www.csfd.cz/hladat/?q=${encodeURIComponent(cleanQuery)}`;
    fallbackResponse.imdbUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(cleanQuery)}`;
    fallbackResponse.description = `Položka z kategórie ${category === 'movies' ? 'film' : 'seriál'}. Vyhľadajte podrobné hodnotenia, recenzie a hercov priamo na ČSFD.cz a IMDb.com.`;
    fallbackResponse.sourceName = 'ČSFD.cz & IMDb.com';
    return res.json(fallbackResponse);
  } else if (category === 'music' || category === 'books') {
    try {
      const searchUrl = `https://sk.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=1&namespace=0&format=json`;
      const searchResp = await fetch(searchUrl, {
        headers: { 'User-Agent': 'MyCatalogApp/1.0 (catalog@example.com)' }
      });
      const searchData = await searchResp.json();
      if (searchData && searchData[1] && searchData[1].length > 0) {
        const pageTitle = searchData[1][0];
        const pageUrl = searchData[3][0];
        const summaryUrl = `https://sk.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryResp = await fetch(summaryUrl, {
          headers: { 'User-Agent': 'MyCatalogApp/1.0 (catalog@example.com)' }
        });
        if (summaryResp.ok) {
          const summary = await summaryResp.json();
          fallbackResponse.title = summary.title || pageTitle;
          fallbackResponse.description = summary.extract || '';
          if (summary.thumbnail) fallbackResponse.coverUrl = summary.thumbnail.source;
          fallbackResponse.wikipediaUrl = pageUrl || summary.content_urls?.desktop?.page;
          fallbackResponse.sourceName = 'Wikipédia (SK)';
          return res.json(fallbackResponse);
        }
      }
    } catch (wikiErr) {
      console.warn('Direct Wikipedia fetch fallback error:', wikiErr);
    }

    fallbackResponse.wikipediaUrl = `https://sk.wikipedia.org/wiki/Špeciálne:Hľadanie?search=${encodeURIComponent(cleanQuery)}`;
    fallbackResponse.description = `Informácie o diele a autorovi nájdete na slovenskej alebo svetovej Wikipédii.`;
    fallbackResponse.sourceName = 'Wikipédia';
    return res.json(fallbackResponse);
  } else if (category === 'games') {
    try {
      const steamApiUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanQuery)}&l=english&cc=SK`;
      const resp = await fetch(steamApiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const appId = String(item.id);
          fallbackResponse.title = item.name;
          fallbackResponse.steamAppId = appId;
          fallbackResponse.steamUrl = `https://store.steampowered.com/app/${appId}/`;
          fallbackResponse.coverUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
          fallbackResponse.platformOrFormat = item.platforms ? Object.keys(item.platforms).filter(p => item.platforms[p]).join(', ') : 'PC (Steam)';
          fallbackResponse.description = `Videohra na platforme Steam. Cena na Steame: ${item.price ? `${(item.price.final / 100).toFixed(2)} €` : 'Závisí od akcie'}.`;
          fallbackResponse.sourceName = 'Steam Store';
          return res.json(fallbackResponse);
        }
      }
    } catch (steamErr) {
      console.warn('Direct Steam fetch fallback error:', steamErr);
    }

    fallbackResponse.steamUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(cleanQuery)}`;
    fallbackResponse.description = `Videohra na platforme Steam. Pozrite si požiadavky na systém, recenzie komunity a zľavy.`;
    fallbackResponse.sourceName = 'Steam';
    return res.json(fallbackResponse);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Môj Katalóg API' });
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
