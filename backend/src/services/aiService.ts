import Groq from 'groq-sdk';
import db from '../database/db';
import vectorStore from '../database/vectorStore';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AIService {
  private groq: Groq | null = null;
  private defaultModel = 'llama-3.3-70b-versatile';

  constructor() {
    const key = process.env.GROQ_API_KEY;
    if (key) {
      this.groq = new Groq({ apiKey: key });
      console.log('Groq SDK initialized successfully for AI Engine.');
    } else {
      console.log('No GROQ_API_KEY found. AI Engine operating in Local Emulation Mode.');
    }
  }

  public async getStreamingResponse(
    query: string,
    role: string,
    history: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void
  ) {
    // 1. Retrieve RAG context from the vector database
    const searchResults = vectorStore.query(query, 3);
    const ragContext = searchResults
      .map((r, idx) => `[Reference ${idx + 1} - Source: ${r.source}]:\n${r.text}`)
      .join('\n\n');

    // 2. Fetch active live database metrics for Context Injection
    const matches = db.getMatches();
    const liveMatch = matches.find((m) => m.status === 'LIVE');
    const crowd = db.getCrowd();
    const incidents = db.getIncidents();
    const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
    const sustainability = db.getSustainability();

    // 3. Formulate the comprehensive System Prompt
    const systemPrompt = `You are VenueOS AI, the Intelligent Operating System for smart stadiums, currently deployed for the FIFA World Cup 2026.
You are assisting a user in the role of: "${role}".
Your responses MUST be professional, concise, extremely operational, and adhere to "mission critical" guidelines.

CURRENT STADIUM DATA:
- Matches Schedule & Scores:
${
  db.getMatches().map(m => `  * Match ${m.matchNumber}: ${m.homeTeam} vs ${m.awayTeam} (Score: ${m.homeScore}-${m.awayScore}, Status: ${m.status}, Time: ${m.dateTime}, Playtime Minute: ${m.minute}')`).join('\n')
}
- Crowd State: Total Occupancy ${crowd.totalOccupancy}/${crowd.maxCapacity} (${crowd.occupancyPercentage}% full). Gate queue times: ${crowd.gates
      .map((g) => `${g.name}: ${g.queueTimeMin} mins`)
      .join(', ')}.
- Incidents: ${activeIncidents.length} active incidents. Critical alerts: ${
      activeIncidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length
    }.
- Sustainability: Live energy draw ${sustainability.liveEnergyUsageKw} kW, solar power contribution ${sustainability.solarContributionPercent}%.

RETRIEVED KNOWLEDGE BASE CONTEXT (RAG):
${ragContext || 'No direct match in the static guides folder. Answer based on general stadium operations policies.'}

INSTRUCTIONS:
1. Ground your answers in the Live Stadium Data and the Retrieved Knowledge Base Context. Do not invent details.
2. Adapt your tone and permission level to the user's role (${role}).
   - Fans: Focus on gate access, transit routes, queue times, food court, and accessibility.
   - Operations Team: Focus on grid metrics, resources, and standard alerts.
   - Security: Focus on incidents, evacuations, risk scores, and tactical safety.
   - Volunteers: Focus on logistics, volunteer maps, and tasks.
3. If the answer cannot be found in the context, clearly state that you do not have that operational detail.
4. Format your output using clear markdown (bullet points, bold text). Do not use purple color labels or neon terms.
`;

    if (this.groq) {
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6), // Send last 6 messages
          { role: 'user', content: query }
        ];

        const chatCompletion = await this.groq.chat.completions.create({
          messages: messages as any,
          model: process.env.GROQ_MODEL || this.defaultModel,
          temperature: 0.2,
          max_tokens: 800,
          stream: true
        });

        let fullContent = '';
        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        }
        onComplete(fullContent);
        return;
      } catch (err) {
        console.error('Groq API Error. Falling back to local emulator...', err);
      }
    }

    // LOCAL EMULATION SYSTEM (Semantic Answer Constructor)
    this.runEmulator(query, role, ragContext, liveMatch, crowd, activeIncidents, sustainability, onChunk, onComplete);
  }

  private runEmulator(
    query: string,
    role: string,
    ragContext: string,
    liveMatch: any,
    crowd: any,
    activeIncidents: any[],
    sustainability: any,
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void
  ) {
    const q = query.toLowerCase();
    let response = '';

    if (q.includes('gate') || q.includes('queue') || q.includes('entrance') || q.includes('congestion')) {
      const slowGates = crowd.gates.filter((g: any) => g.queueTimeMin > 10);
      const gateStats = crowd.gates.map((g: any) => `* **${g.name}**: ${g.queueTimeMin} minute wait (${g.status} status)`).join('\n');
      
      response = `### Gate Congestion & Entry Status Briefing

The stadium is currently at **${crowd.occupancyPercentage}% capacity** (${crowd.totalOccupancy} spectators present).

**Gate Operations Summary:**
${gateStats}

${
  slowGates.length > 0
    ? `> [!WARNING]\n> **Action Recommended**: Gate congestion is elevated at ${slowGates.map((g: any) => g.name).join(', ')}. Security should route incoming fans towards **Gate C (South)** which has the lowest wait times (8 minutes).`
    : `> [!NOTE]\n> Entry flow is running within nominal limits. All turnstile scanners are operational.`
}

*Reference: Live Crowd Ingestion Feed (sensor_grid_5).*`;
    } else if (q.includes('incident') || q.includes('emergency') || q.includes('accident') || q.includes('alert')) {
      if (role === 'Fan') {
        response = `### Security Notice

There are no public emergency directives in effect. The stadium operations team is monitoring entry flows. 
Please follow the overhead indicators or ask volunteers at your section if you require assistance.

*Emergency exit paths are highlighted in the Navigation Center tab.*`;
      } else {
        const incidentList = activeIncidents.map((i) => `* **[${i.id}]** [${i.category} - ${i.severity}] in *${i.location}*: ${i.description} (Assigned to: ${i.assignedTeam})`).join('\n');
        response = `### Operational Incident Report - Security View

There are currently **${activeIncidents.length} active incidents** requiring supervision:

${incidentList || '*No unresolved operational incidents logged.*'}

${
  activeIncidents.some((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH')
    ? `> [!IMPORTANT]\n> **Priority Dispatch**: A critical issue is flagged at **Gate A (North)**. Scanner failures are backing up queues. Response teams are configuring auxiliary gates.`
    : `> [!NOTE]\n> All registered reports are of low-to-medium risk. Standard protocols are in place.`
}

Use the **Emergency Center** panel to push automated PA announcements if evacuation routing is needed.`;
      }
    } else if (q.includes('sustainability') || q.includes('energy') || q.includes('solar') || q.includes('carbon') || q.includes('power')) {
      response = `### Stadium Sustainability and Grid Performance

Here is the real-time ecological efficiency breakdown:

* **Live Energy Demand**: ${sustainability.liveEnergyUsageKw} kW
* **Renewable Contribution**: ${sustainability.solarContributionPercent}% solar generation (offsetting ${sustainability.carbonOffsetsKg} kg of CO2 equivalent)
* **Water Usage**: ${sustainability.waterConsumptionLiters} Liters (${sustainability.reclaimedWaterPercent}% sourced from stadium graywater reclaimers)
* **Waste Recovery**: ${sustainability.wasteGeneratedTons} Tons collected with a **${sustainability.recyclingRatePercent}% recycling rate**.

> [!TIP]
> Peak grid draw is forecasted to hit ${sustainability.peakEnergyUsageKw} kW near match conclusion. Smart load balancing is routing secondary chiller plants to solar buffer cells.`;
    } else if (q.includes('match') || q.includes('score') || q.includes('who is playing') || q.includes('game') || q.includes('schedule') || q.includes('fixtures') || q.includes('semi-final')) {
      const allMatches = db.getMatches();
      const live = allMatches.find(m => m.status === 'LIVE');
      const scheduled = allMatches.filter(m => m.status === 'SCHEDULED');
      const finished = allMatches.filter(m => m.status === 'FINISHED');

      let details = '';
      if (live) {
        details += `### Live Match Active Now\n\n`;
        details += `* **Game**: **${live.homeTeam} vs ${live.awayTeam}**\n`;
        details += `* **Scoreline**: **${live.homeScore} - ${live.awayScore}**\n`;
        details += `* **Time**: Minute ${live.minute}' (${live.group})\n`;
        details += `* **Venue**: ${live.stadium} (Attendance: ${live.attendance.toLocaleString()} spectators)\n\n`;
      }

      if (scheduled.length > 0) {
        details += `### Upcoming Matches Today\n\n`;
        scheduled.forEach(m => {
          const timeStr = new Date(m.dateTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';
          details += `* **${m.homeTeam} vs ${m.awayTeam}** - Scheduled kickoff at **${timeStr}** (${m.group})\n`;
        });
        details += `\n`;
      }

      if (finished.length > 0) {
        details += `### Recent Completed Matches\n\n`;
        finished.forEach(m => {
          details += `* **${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}** (Final score)\n`;
        });
      }

      if (allMatches.length === 0) {
        details = 'No active or upcoming match schedules are loaded in the database.';
      }

      response = `### Tournament Scoreboard & Schedules\n\n${details}`;
    } else if (ragContext.length > 0) {
      response = `### Retrieved Information (Stadium Knowledge Base)

Based on the operational manuals, I retrieved the following details:

${ragContext}

If you require modifications to these policies, please update the corresponding guide file via the **Upload Center**.`;
    } else {
      response = `### VenueOS AI Operational Support

Hello! I am **VenueOS AI**, the stadium's real-time intelligence assistant. 

As a **${role}**, you can ask me questions about:
1. **Queue Predictions & Gate States** (e.g. "What is the wait time at Gate A?")
2. **Incident Updates** (e.g. "Show me active incidents")
3. **Power grid & Carbon performance** (e.g. "What is our solar power level?")
4. **Active Matches** (e.g. "What is the live score?")
5. **Stadium layout policies** from our knowledge files.

Please let me know how I can assist your operations shift today.`;
    }

    // Stream the emulator response word-by-word
    const words = response.split(' ');
    let currentIdx = 0;
    
    const interval = setInterval(() => {
      if (currentIdx >= words.length) {
        clearInterval(interval);
        onComplete(response);
      } else {
        const chunk = words[currentIdx] + (currentIdx === words.length - 1 ? '' : ' ');
        onChunk(chunk);
        currentIdx++;
      }
    }, 20); // 20ms per word creates a highly natural streaming simulation
  }
}

export const aiService = new AIService();
export default aiService;
