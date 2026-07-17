import { request } from 'undici';

interface Episode {
    title: string;
    season: number;
    episode: number;
}

function isEpisode(data: unknown): data is Episode {
    return (
        typeof data === 'object' &&
        data !== null &&
        'title' in data &&
        typeof data.title === 'string' &&
        'season' in data &&
        typeof data.season === 'number' &&
        'episode' in data &&
        typeof data.episode === 'number'
    );
}

class SimpsonService {
    /**
     * Obtiene un episodio aleatorio de Los Simpson.
     * @throws {Error} Si la API falla o la respuesta es inválida.
     */
    static async getRandomEpisode(): Promise<Episode> {
        try {
            const response = await request('https://www.simpsonsoptimizer.com/episodes/good/');
            
            if (response.statusCode !== 200) {
                throw new Error(`API responded with status ${response.statusCode}`);
            }
            
            const data: unknown = await response.body.json();
            
            if (!isEpisode(data)) {
                throw new Error('Invalid episode data structure');
            }
            
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch random episode: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export default SimpsonService;