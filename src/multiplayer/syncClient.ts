import Peer, { type DataConnection } from 'peerjs';
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import type { ConnectionStatus, PlayerRole, SyncMessage } from './types';

// Normaliser le code de salle (6 caractères majuscules alphanumériques)
export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class RealtimeSyncClient {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;

  // Supabase Realtime
  private supabase: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private isUsingSupabase: boolean = false;

  private roomCode: string = '';
  private role: PlayerRole = 1;
  private status: ConnectionStatus = 'DISCONNECTED';
  private onStatusChangeCallback: ((status: ConnectionStatus, detail?: string) => void) | null = null;
  private onMessageCallback: ((message: SyncMessage) => void) | null = null;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('votre-projet')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
        this.isUsingSupabase = true;
        console.log('[Multiplayer] Supabase Realtime Broadcast initialisé.');
      } catch (e) {
        console.warn('[Multiplayer] Échec init Supabase, fallback WebRTC:', e);
        this.isUsingSupabase = false;
      }
    } else {
      console.log('[Multiplayer] Clés Supabase non configurées, utilisation du fallback WebRTC PeerJS.');
    }
  }

  public onStatusChange(callback: (status: ConnectionStatus, detail?: string) => void) {
    this.onStatusChangeCallback = callback;
  }

  public onMessage(callback: (message: SyncMessage) => void) {
    this.onMessageCallback = callback;
  }

  private setStatus(status: ConnectionStatus, detail?: string) {
    this.status = status;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status, detail);
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getRole(): PlayerRole {
    return this.role;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public isUsingSupabaseBackend(): boolean {
    return this.isUsingSupabase;
  }

  // Créer une salle en tant qu'Hôte (Joueur 1)
  public createRoom(code?: string): string {
    this.disconnect();
    this.role = 1;
    this.roomCode = code ? normalizeRoomCode(code) : generateRoomCode();
    this.setStatus('CONNECTING', 'Initialisation du salon...');

    if (this.isUsingSupabase && this.supabase) {
      this.setupSupabaseChannel();
    } else {
      this.setupPeerJSHost();
    }

    return this.roomCode;
  }

  // Rejoindre une salle en tant qu'Invité (Joueur 2)
  public joinRoom(code: string): Promise<void> {
    this.disconnect();
    this.role = 2;
    this.roomCode = normalizeRoomCode(code);
    this.setStatus('CONNECTING', `Connexion au salon ${this.roomCode}...`);

    if (this.isUsingSupabase && this.supabase) {
      return this.setupSupabaseChannel();
    } else {
      return this.setupPeerJSGuest();
    }
  }

  // --- SUPABASE REALTIME BROADCAST ---
  private async setupSupabaseChannel(): Promise<void> {
    if (!this.supabase) return;

    const channelName = `taktik-room-${this.roomCode}`;
    const channel = this.supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: `player-${this.role}-${Date.now()}` },
      },
    });

    this.channel = channel;

    channel.on('broadcast', { event: 'game-event' }, ({ payload }) => {
      const msg = payload as SyncMessage;
      if (this.onMessageCallback) {
        this.onMessageCallback(msg);
      }
    });

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const keys = Object.keys(presenceState);
      if (keys.length >= 2) {
        this.setStatus('CONNECTED', 'Joueur adverse connecté via Supabase !');
      } else if (this.role === 1) {
        this.setStatus('WAITING_FOR_OPPONENT', `En attente du joueur 2 (Code: ${this.roomCode})`);
      }
    });

    channel.on('presence', { event: 'leave' }, () => {
      const remaining = Object.keys(channel.presenceState()).length;
      if (remaining < 2 && this.status === 'CONNECTED') {
        this.setStatus('DISCONNECTED', "L'adversaire s'est déconnecté.");
      }
    });

    await channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ role: this.role, onlineAt: Date.now() });
        if (this.role === 1) {
          this.setStatus('WAITING_FOR_OPPONENT', `En attente du joueur 2 (Code: ${this.roomCode})`);
        } else {
          this.setStatus('CONNECTED', 'Connecté à la salle !');
          this.sendMessage({
            type: 'JOIN_REQUEST',
            senderRole: 2,
            roomCode: this.roomCode,
            timestamp: Date.now(),
          });
        }
      } else if (status === 'CHANNEL_ERROR') {
        this.setStatus('ERROR', 'Erreur de connexion au canal Supabase.');
      }
    });
  }

  // --- PEERJS WEBRTC FALLBACK ---
  private setupPeerJSHost() {
    const hostPeerId = `taktik-v1-${this.roomCode}-host`;
    this.peer = new Peer(hostPeerId, { debug: 1 });

    this.peer.on('open', () => {
      this.setStatus('WAITING_FOR_OPPONENT', `En attente de l'adversaire (Code: ${this.roomCode})`);
    });

    this.peer.on('connection', (conn) => {
      this.connection = conn;
      this.setupConnectionHandlers(conn);
      this.setStatus('CONNECTED', 'Joueur 2 connecté !');
    });

    this.peer.on('error', (err) => {
      console.error('[Multiplayer Host Error]', err);
      if (err.type === 'unavailable-id') {
        const newCode = generateRoomCode();
        this.createRoom(newCode);
      } else {
        this.setStatus('ERROR', `Erreur réseau: ${err.type}`);
      }
    });
  }

  private setupPeerJSGuest(): Promise<void> {
    return new Promise((resolve, reject) => {
      const guestPeerId = `taktik-v1-${this.roomCode}-guest-${Date.now().toString(36)}`;
      this.peer = new Peer(guestPeerId, { debug: 1 });

      this.peer.on('open', () => {
        const hostPeerId = `taktik-v1-${this.roomCode}-host`;
        const conn = this.peer!.connect(hostPeerId, { reliable: true });
        this.connection = conn;
        this.setupConnectionHandlers(conn);

        conn.on('open', () => {
          this.setStatus('CONNECTED', 'Connecté à la partie !');
          this.sendMessage({
            type: 'JOIN_REQUEST',
            senderRole: 2,
            roomCode: this.roomCode,
            timestamp: Date.now(),
          });
          resolve();
        });
      });

      this.peer.on('error', (err) => {
        console.error('[Multiplayer Guest Error]', err);
        this.setStatus('ERROR', `Impossible de rejoindre le salon (${err.type})`);
        reject(err);
      });
    });
  }

  private setupConnectionHandlers(conn: DataConnection) {
    conn.on('data', (raw: any) => {
      const message = raw as SyncMessage;
      if (this.onMessageCallback) {
        this.onMessageCallback(message);
      }
    });

    conn.on('close', () => {
      this.setStatus('DISCONNECTED', "L'adversaire s'est déconnecté.");
    });

    conn.on('error', (err) => {
      console.error('[Connection Error]', err);
      this.setStatus('ERROR', 'Erreur de connexion avec le joueur.');
    });
  }

  // Envoyer un message synchronisé
  public sendMessage(message: SyncMessage) {
    if (this.isUsingSupabase && this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'game-event',
        payload: message,
      });
    } else if (this.connection && this.connection.open) {
      this.connection.send(message);
    }
  }

  // Déconnexion
  public disconnect() {
    if (this.channel && this.supabase) {
      try {
        this.supabase.removeChannel(this.channel);
      } catch {}
      this.channel = null;
    }
    if (this.connection) {
      try {
        this.connection.close();
      } catch {}
      this.connection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
    this.setStatus('DISCONNECTED');
  }
}
