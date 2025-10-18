import { RoomPlayer } from './RoomPlayer';

export enum GameMode {
  CLASSIC = 'classic',
  COUNTRY = 'country',
  CUSTOM_AREA = 'custom_area',
}
export enum ScoreMode {
  NORMAL = 'normal',
  TIME = 'time',
}

export enum AreaMode {
  NOMINATIM = 'nominatim',
  POLYGON = 'polygon',
}

export class RoomConfig {
  constructor(options?: Partial<RoomConfig>) {
    if (options) {
      Object.assign(this, options);
    }
  }

  allPanorama: boolean = false;
  allowReRoll: boolean = true;
  countdown: number = 0;
  createdAt: number;
  difficulty: number = 2000;
  guessedLeaderboard: boolean = true;
  modeSelected: GameMode = GameMode.CLASSIC;
  moveControl: boolean = true;
  nbRoundSelected: number = 5;
  optimiseStreetView: boolean = true;
  panControl: boolean = true;
  scoreLeaderboard: boolean = true;
  scoreMode: ScoreMode = ScoreMode.NORMAL;
  time: number = 0;
  timeAttackSelected: boolean = false;
  timeLimitation: number = 0;
  zoomControl: boolean = true;
  bboxObj: number[];
}

export class Room {
  constructor(options?: Partial<Room>) {
    if (options) {
      Object.assign(this, options);
    }
  }

  name: string;
  ownerPlayerId: string;
  started: boolean = false;
  config: RoomConfig = new RoomConfig();
  players: RoomPlayer[] = [];
  createdAt: number = new Date().getTime();
}
