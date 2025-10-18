import { Player } from '../players/Player';

export class RoomPlayer {
  player: Player;
  connected: boolean;
  /**
   * If the player has been disconnected for a long time, they will be kicked by server.
   * @type {number | null}
   */
  kickAt: number | null = null;
}
