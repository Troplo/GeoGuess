import { RoomConfig } from '../../classes/rooms/Room';
import { EmptyObject } from './serverEvents';

export enum GameSocketClientEvent {
    CREATE_ROOM = 'CREATE_ROOM',
    USER_UPDATE_NAME = 'USER_UPDATE_NAME',
    ROOM_UPDATE_CONFIG = 'ROOM_UPDATE_CONFIG',
    ROOM_LEAVE = 'ROOM_LEAVE',
    GAME_START = 'GAME_START',
    GAME_POPULATE_ROUND_INFO = 'GAME_POPULATE_ROUND_INFO',
    GAME_COMMIT_GUESS = 'GAME_COMMIT_GUESS',
    GAME_READY_TO_LEAVE = 'GAME_READY_TO_LEAVE',
    GAME_READY = 'GAME_READY',
    GAME_READY_TO_CONTINUE = 'GAME_READY_TO_CONTINUE',
    GAME_VOTE_TO_REROLL = 'GAME_VOTE_TO_REROLL',
}

export interface GameSocketClientEvents {
    [GameSocketClientEvent.CREATE_ROOM]: {
        name: string;
    };
    [GameSocketClientEvent.USER_UPDATE_NAME]: {
        name: string;
    };
    [GameSocketClientEvent.ROOM_UPDATE_CONFIG]: {
        roomName: string;
        config: RoomConfig;
    };
    [GameSocketClientEvent.ROOM_LEAVE]: {
        roomName: string;
    };
    [GameSocketClientEvent.GAME_START]: {
        roomName: string;
        config: RoomConfig;
    };
    [GameSocketClientEvent.GAME_POPULATE_ROUND_INFO]: {
        round: number;
        latitude: number;
        longitude: number;
        warning: boolean;
    };
    [GameSocketClientEvent.GAME_COMMIT_GUESS]: {
        longitude: number;
        latitude: number;
        distance: number;
        points: number;
        timePassed: number;
        round: number;
    };
    [GameSocketClientEvent.GAME_READY_TO_LEAVE]: EmptyObject;
    [GameSocketClientEvent.GAME_READY]: EmptyObject;
    [GameSocketClientEvent.GAME_READY_TO_CONTINUE]: {
        nextRound: number;
    };
    [GameSocketClientEvent.GAME_VOTE_TO_REROLL]: {
        round: number;
    };
}
