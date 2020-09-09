import { ResponseType } from "./types";

export interface IHaxanOptions {
  url: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
  type: ResponseType;
}

export interface IHaxanResponse<T> {
  data: T;
  ok: boolean;
  status: number;
  headers: Record<string, string>;
}
