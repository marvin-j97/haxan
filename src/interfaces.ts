import { ResponseType } from "./types";

export type RejectionFunction = (status: number) => boolean;

export interface IHaxanOptions {
  url: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
  type: ResponseType;
  rejectOn: RejectionFunction;
  abortSignal?: AbortSignal;
  timeout: number;
}

export interface IHaxanResponse<T> {
  data: T;
  ok: boolean;
  status: number;
  headers: Record<string, string>;
}
