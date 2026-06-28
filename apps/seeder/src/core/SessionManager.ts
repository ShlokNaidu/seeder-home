import { BrowserRuntime } from '@seeder/browser-runtime';
import { SessionAcquisitionEngine } from '../subsystems/session-acquisition/SessionAcquisitionEngine';

export class SessionManager {
    private activeSession: any | null = null;

    constructor(private sessionEngine: SessionAcquisitionEngine) {}

    public async getSession(url: string, email?: string, password?: string, artifactDir?: string): Promise<any> {
        if (this.activeSession) {
            console.log("[SessionManager] Restoring existing active session...");
            return this.activeSession;
        }

        console.log("[SessionManager] No active session found. Reauthenticating...");
        if (!email || !password) {
            throw new Error("Credentials required for initial authentication");
        }
        
        this.activeSession = await this.sessionEngine.acquireSession(url, email, password, artifactDir);
        return this.activeSession;
    }

    public clearSession(): void {
        this.activeSession = null;
    }
}
