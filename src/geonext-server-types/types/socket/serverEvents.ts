import { Room } from '../../classes/rooms/Room';
import { ErrorOf } from '../../errors';

export type Request<T> = T & { id: string };

export enum GameSocketServerEvent {
  HELLO = 'HELLO',
  CREATE_ROOM_RESPONSE = 'CREATE_ROOM_RESPONES',
}

export interface GameSocketEventsServer {
  HELLO: {
    payload: {
      playerId: string;
    };
  };
  CREATE_ROOM_RESPONSE: {
    payload: Room;
    errors: ErrorOf<'ROOM_NAME_UNAVAILABLE'>;
  };
}

export type Response<T, E = never> = { id: string } & (E extends never
  ? { data: T }
  : { data?: T; errors: E });

export type EventResponse<K extends keyof GameSocketEventsServer> = Response<
  GameSocketEventsServer[K]['payload'],
  GameSocketEventsServer[K] extends { errors: infer E } ? E : never
>;
