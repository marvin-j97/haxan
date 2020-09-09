export class HaxanError extends Error {
  isHaxanError = true;
}

export class HaxanTimeout extends HaxanError {
  isTimeout = true;

  constructor() {
    super();
  }
}

export class HaxanRejection extends HaxanError {
  isRejection = true;
  response: Response;

  constructor(res: Response) {
    super();
    this.response = res;
  }
}

export class HaxanAbort extends HaxanError {
  isAbort = true;

  constructor() {
    super();
  }
}

export enum ResponseType {
  Auto = "auto",
  Json = "json",
  Text = "text",
  Stream = "stream",
}

export enum HTTPMethod {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
  Head = "HEAD",
  Options = "OPTIONS",
}
