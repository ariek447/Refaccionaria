// Error con código HTTP. El manejador central lo convierte en respuesta JSON.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
