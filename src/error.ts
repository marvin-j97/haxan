import { IHaxanResponse } from "./types";

export enum HaxanErrorType {
  NetworkError = "NetworkError",
  ParseError = "ParseError",
  Timeout = "Timeout",
  Abort = "Abort",
}

/**
 * Thrown on internal errors
 */
export class HaxanError<T = unknown> {
  private type: HaxanErrorType;
  private rawError: Error | null = null;
  private response: IHaxanResponse<T> | null = null;
  private message: string;

  constructor(
    type: HaxanErrorType,
    message: string,
    originalError: Error | null,
    response?: IHaxanResponse<T>,
  ) {
    this.message = message;
    this.type = type;

    if (originalError) {
      this.rawError = originalError;
    }

    if (response) {
      this.response = response;
    }
  }

  getMessage(): string {
    return this.message;
  }

  getType(): HaxanErrorType {
    return this.type;
  }

  getOriginalError(): Error | null {
    return this.rawError;
  }

  getResponse(): IHaxanResponse<T> | null {
    return this.response;
  }
}
