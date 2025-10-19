import { RoomPlayer } from './RoomPlayer';
import { Player } from '../players/Player';

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

export class Round {
    constructor(options?: Partial<Round>) {
        if (options) {
            Object.assign(this, options);
            if (options.latitude && typeof options.latitude !== 'number') {
                this.latitude = parseFloat(options.latitude);
            }
            if (options.longitude && typeof options.longitude !== 'number') {
                this.longitude = parseFloat(options.longitude);
            }
        }
    }

    round: number;
    latitude: number;
    longitude: number;
    warning: boolean;
    version: number = 1;
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
    createdAt: number = new Date().getTime();
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
    bboxObj: number[] | undefined;
    version: number = 1;
}

export class Room {
    constructor(options?: Partial<Room>) {
        if (options) {
            Object.assign(this, options);
            // make sure nested objects are proper instances
            if (options.config) this.config = new RoomConfig(options.config);
            if (options.rounds?.length) {
                this.rounds = [];
                for (const round of options.rounds) {
                    this.rounds.push(new Round(round));
                }
            }
        }
    }

    name: string;
    ownerPlayerId: string;
    started: boolean = false;
    config: RoomConfig = new RoomConfig();
    version: number = 1;
    rounds: Round[] = [];
    players: RoomPlayer[] | null;
    currentRound: number = 0;
}
