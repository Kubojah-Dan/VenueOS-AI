import * as fs from 'fs';
import * as path from 'path';

interface DocumentChunk {
  text: string;
  source: string;
  tokens: Set<string>;
}

class LocalVectorStore {
  private chunks: DocumentChunk[] = [];
  private stopwords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
    'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
    'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
    'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
    'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
    'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
    'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres',
    'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
    'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
    'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
    'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
    'your', 'yours', 'yourself', 'yourselves'
  ]);

  public async initialize() {
    this.chunks = [];
    const kbDir = path.join(__dirname, '../../../knowledge-base');
    
    if (fs.existsSync(kbDir)) {
      this.scanDirectory(kbDir);
    }
    console.log(`Initialized Local Vector Store with ${this.chunks.length} document chunks.`);
  }

  private scanDirectory(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.txt') || item.endsWith('.md') || item.endsWith('.json'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const source = path.relative(path.join(__dirname, '../../../'), fullPath);
          
          if (item.endsWith('.json')) {
            // Index strings inside JSON
            this.chunkText(JSON.stringify(JSON.parse(content), null, 2), source);
          } else {
            this.chunkText(content, source);
          }
        } catch (err) {
          console.error(`Failed to read/chunk knowledge base file ${fullPath}:`, err);
        }
      }
    }
  }

  private chunkText(text: string, source: string) {
    // Split by paragraphs first (double newlines) or group sentences
    const sections = text.split(/\n\s*\n/);
    for (const sec of sections) {
      const trimmed = sec.trim();
      if (trimmed.length < 20) continue;
      
      // Create chunk
      this.chunks.push({
        text: trimmed,
        source,
        tokens: this.tokenize(trimmed)
      });
    }
  }

  private tokenize(text: string): Set<string> {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/);
      
    const set = new Set<string>();
    for (const w of words) {
      if (w.length > 1 && !this.stopwords.has(w)) {
        set.add(w);
      }
    }
    return set;
  }

  public addText(text: string, source: string) {
    this.chunkText(text, source);
    console.log(`Dynamically indexed text chunk from ${source}. Store size: ${this.chunks.length} chunks.`);
  }

  // Calculate standard Jaccard Similarity / TF-IDF approximation
  public query(queryText: string, limit: number = 3): Array<{ text: string; source: string; score: number }> {
    const queryTokens = this.tokenize(queryText);
    if (queryTokens.size === 0) return [];

    const results = this.chunks.map((chunk) => {
      let matchCount = 0;
      for (const t of queryTokens) {
        if (chunk.tokens.has(t)) {
          matchCount++;
        }
      }
      
      // Jaccard similarity index
      const unionSize = new Set([...queryTokens, ...chunk.tokens]).size;
      const score = unionSize > 0 ? matchCount / unionSize : 0;
      
      return {
        text: chunk.text,
        source: chunk.source,
        score
      };
    });

    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const vectorStore = new LocalVectorStore();
export default vectorStore;
