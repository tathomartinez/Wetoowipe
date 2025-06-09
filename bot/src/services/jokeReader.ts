import fs from 'fs';
import path from 'path';

export class JokeRepository {
    private jokes: string[];

    constructor(filePath: string) {
        const contenido = fs.readFileSync(filePath, 'utf-8');
        this.jokes = contenido.split('\n').filter(line => line.trim().length > 0);
    }

    getRandomJoke(): string {
        const idx = Math.floor(Math.random() * this.jokes.length);
        return this.jokes[idx];
    }
}