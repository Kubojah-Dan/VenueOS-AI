import * as fs from 'fs';
import * as path from 'path';

interface DocumentChunk {
  text: string;
  source: string;
  termFrequencies: Map<string, number>;
  totalTerms: number;
}

class LocalVectorStore {
  private chunks: DocumentChunk[] = [];
  private idfMap: Map<string, number> = new Map();
  private allUniqueTerms: Set<string> = new Set();
  
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
    this.calculateIDF();
    console.log(`Initialized Cosine Similarity Vector Store with ${this.chunks.length} document chunks.`);
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
    const sections = text.split(/\n\s*\n/);
    for (const sec of sections) {
      const trimmed = sec.trim();
      if (trimmed.length < 20) continue;
      
      const wordsList = this.tokenize(trimmed);
      if (wordsList.length === 0) continue;

      const termFrequencies = new Map<string, number>();
      for (const word of wordsList) {
        termFrequencies.set(word, (termFrequencies.get(word) || 0) + 1);
        this.allUniqueTerms.add(word);
      }

      this.chunks.push({
        text: trimmed,
        source,
        termFrequencies,
        totalTerms: wordsList.length
      });
    }
  }

  private tokenize(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/);
      
    const result: string[] = [];
    for (const w of words) {
      if (w.length > 1 && !this.stopwords.has(w)) {
        result.push(w);
      }
    }
    return result;
  }

  private calculateIDF() {
    this.idfMap.clear();
    const docCount = this.chunks.length;
    if (docCount === 0) return;

    for (const term of this.allUniqueTerms) {
      let containingDocs = 0;
      for (const chunk of this.chunks) {
        if (chunk.termFrequencies.has(term)) {
          containingDocs++;
        }
      }
      // IDF using logarithmic scale with smoothing
      const idf = Math.log(1 + docCount / (1 + containingDocs));
      this.idfMap.set(term, idf);
    }
  }

  public addText(text: string, source: string) {
    this.chunkText(text, source);
    this.calculateIDF();
    console.log(`Dynamically indexed text chunk. Store size: ${this.chunks.length} chunks.`);
  }

  // Retrieval using Dense Term-Frequency Inverse-Document-Frequency Cosine Similarity
  public query(queryText: string, limit: number = 3): Array<{ text: string; source: string; score: number }> {
    const queryWords = this.tokenize(queryText);
    if (queryWords.length === 0 || this.chunks.length === 0) return [];

    // Compute TF for the query vector
    const queryFrequencies = new Map<string, number>();
    for (const word of queryWords) {
      queryFrequencies.set(word, (queryFrequencies.get(word) || 0) + 1);
    }

    // Build Query TF-IDF Vector
    const queryVector = new Map<string, number>();
    let queryMagnitudeSquared = 0;
    
    for (const [term, count] of queryFrequencies.entries()) {
      const tf = count / queryWords.length;
      const idf = this.idfMap.get(term) || 0.0;
      const tfidf = tf * idf;
      queryVector.set(term, tfidf);
      queryMagnitudeSquared += tfidf * tfidf;
    }

    const queryMagnitude = Math.sqrt(queryMagnitudeSquared);
    if (queryMagnitude === 0) return [];

    const results = this.chunks.map((chunk) => {
      let dotProduct = 0;
      let docMagnitudeSquared = 0;

      // Calculate doc TF-IDF vector magnitude
      for (const [term, count] of chunk.termFrequencies.entries()) {
        const docTf = count / chunk.totalTerms;
        const docIdf = this.idfMap.get(term) || 0.0;
        const docTfidf = docTf * docIdf;
        docMagnitudeSquared += docTfidf * docTfidf;

        // Dot product with query vector
        if (queryVector.has(term)) {
          dotProduct += docTfidf * (queryVector.get(term) || 0);
        }
      }

      const docMagnitude = Math.sqrt(docMagnitudeSquared);
      const cosineSimilarity = (docMagnitude > 0 && queryMagnitude > 0)
        ? (dotProduct / (docMagnitude * queryMagnitude))
        : 0;

      return {
        text: chunk.text,
        source: chunk.source,
        score: cosineSimilarity
      };
    });

    return results
      .filter((r) => r.score > 0.02) // minimal filter
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const vectorStore = new LocalVectorStore();
export default vectorStore;
