import { describe, it, expect } from 'vitest';
import jokeReader from '../src/services/jokeReader';

describe('jokeReader service', () => {
	it('debe contener una lista de chistes', () => {
		expect(jokeReader.listaChistes).toBeDefined();
		expect(Array.isArray(jokeReader.listaChistes)).toBe(true);
		expect(jokeReader.listaChistes.length).toBeGreaterThan(0);
	});

	it('debe devolver un chiste aleatorio como string', () => {
		const chiste = jokeReader.listaChistes[Math.floor(Math.random() * jokeReader.listaChistes.length)];
		expect(typeof chiste).toBe('string');
		expect(chiste.length).toBeGreaterThan(0);
	});
});
