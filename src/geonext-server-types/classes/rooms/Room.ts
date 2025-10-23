import { RoomPlayer } from './RoomPlayer';
import { Player } from '../players/Player';
import { FeatureCollection } from '@turf/helpers';

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

export enum RoomState {
    LOBBY,
    IN_GAME,
    ROUND_FINISHED,
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
    timerStart: number = new Date().getTime();
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
    // version 2 fields
    geoJson: FeatureCollection | null = null;

    version: number = 2;
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
    players?: RoomPlayer[] | null;
    currentRound: number = 0;
    timerStart: number = new Date().getTime();

    // Protection: do not assign state directly
    private _state: RoomState = RoomState.LOBBY;
    get state(): RoomState {
        return this._state;
    }
    async getPlayers(): Promise<RoomPlayer[]> {
        if (!redisDirect) return [];
        const players = await redisDirect?.get(`room:${this.name}:players`);

        if (!players) return [];

        try {
            const parsed = JSON.parse(players) as RoomPlayer[];

            const importedPlayers: RoomPlayer[] = [];

            for (const player of parsed) {
                const roomPlayer = new RoomPlayer(player);
                roomPlayer.player = await roomPlayer.getPlayer();
                importedPlayers.push(roomPlayer);
            }
            return importedPlayers;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    getRoundIsValid(roundId: number): boolean {
        const round = this.rounds.find((rnd) => rnd.round === roundId);
        return !!round && roundId <= this.currentRound;
    }

    getRound(roundId: number): Round | null {
        const round = this.rounds.find((rnd) => rnd.round === roundId);
        return round || null;
    }

    /**
     * DO NOT USE DIRECTLY!
     * Use the RoomService.setState function instead to ensure all participants get the event.
     * @param {RoomState} state
     */
    _setState(state: RoomState) {
        this._state = state;
    }
}
