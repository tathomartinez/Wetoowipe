import { request } from 'undici';

interface Episode {
    title: string;
    season: number;
    episode: number;
}

class SimpsonService {
    static async getRandomEpisode(): Promise<Episode> {
        const call = await request('https://www.simpsonsoptimizer.com/episodes/good/');
        const value = await call.body.json();
        return value as Episode;
    }
}

export default SimpsonService;
