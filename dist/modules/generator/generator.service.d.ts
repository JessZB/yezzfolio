/**
 * GeneratorService
 * Handles the generation of static JSON payloads for Astro SSG.
 * Ensures 100% compatibility with bridge/ portfolio structure.
 */
export declare class GeneratorService {
    /**
     * Generates the full site payload (Works + Profile) for both languages.
     */
    static buildFullPayload(userId: string): Promise<any>;
    /**
     * Option B: Triggers a webhook (Vercel/Netlify Deploy Hook) with the payload.
     */
    static triggerWebhook(url: string, payload: any): void;
}
