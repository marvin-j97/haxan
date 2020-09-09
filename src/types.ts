export class HaxanError extends Error {
  isHaxanError = true;
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
