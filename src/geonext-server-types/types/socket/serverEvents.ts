import { Room, RoomConfig, Round } from '../../classes/rooms/Room';
import { RoomPlayer, RoomPlayerRound } from '../../classes/rooms/RoomPlayer';

export type Request<T> = T & { id: string };

export enum GameSocketServerEvent {
    HELLO = 'HELLO',
    CREATE_ROOM_RESPONSE = 'CREATE_ROOM_RESPONSE',
    ROOM_PLAYER_LEFT = 'ROOM_PLAYER_LEFT',
    ROOM_PLAYER_JOINED = 'ROOM_PLAYER_JOINED',
    ROOM_PLAYER_DISCONNECTED = 'ROOM_PLAYER_DISCONNECTED',
    ROOM_PLAYER_RECONNECTED = 'ROOM_PLAYER_RECONNECTED',
    GAME_CONFIG = 'GAME_CONFIG',
    // On name change, etc
    PLAYER_UPDATED = 'PLAYER_UPDATED',
    GAME_STARTED = 'GAME_STARTED',
    GAME_NEW_ROUND = 'GAME_NEW_ROUND',
    ROOM_PLAYER_SCORE_DETAILS_UPDATED = 'ROOM_PLAYER_SCORE_DETAILS_UPDATED',
    GAME_FINISHED = 'GAME_FINISHED',
}

export interface GameSocketEventsServer {
    [GameSocketServerEvent.HELLO]: {
        payload: {
            playerId: string;
        };
    };
    [GameSocketServerEvent.CREATE_ROOM_RESPONSE]: Room;
    [GameSocketServerEvent.ROOM_PLAYER_LEFT]: RoomPlayer;
    [GameSocketServerEvent.ROOM_PLAYER_JOINED]: RoomPlayer;
    [GameSocketServerEvent.ROOM_PLAYER_DISCONNECTED]: RoomPlayer;
    [GameSocketServerEvent.ROOM_PLAYER_RECONNECTED]: RoomPlayer;
    [GameSocketServerEvent.GAME_CONFIG]: RoomConfig;
    [GameSocketServerEvent.PLAYER_UPDATED]: RoomPlayer;
    [GameSocketServerEvent.GAME_STARTED]: {};
    [GameSocketServerEvent.GAME_NEW_ROUND]: Round;
    [GameSocketServerEvent.ROOM_PLAYER_SCORE_DETAILS_UPDATED]: {
        playerId: string;
        round: RoomPlayerRound;
    };
    [GameSocketServerEvent.GAME_FINISHED]: {};
}

export type Response<T, E = never> = { id: string } & (E extends never
    ? { data: T }
    : { data?: T; errors: E });

// export type EventResponse<K extends keyof GameSocketEventsServer> = Response<
//   GameSocketEventsServer[K]['payload'],
//   GameSocketEventsServer[K] extends { errors: infer E } ? E : never
// >;
