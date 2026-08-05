// Erro com status HTTP associado, usado pelos controllers para montar a resposta.

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = HttpError;
