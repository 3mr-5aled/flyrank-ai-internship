// ===========================================================================
// ERROR-HANDLING MIDDLEWARE — one place that turns domain errors into HTTP.
// ===========================================================================
// The service throws meaning ("this is invalid", "this wasn't found"); this
// middleware decides the status code. Because it lives in ONE place, every
// route gets consistent error responses for free — no repeated 400/404 code.
const { NotFoundError, ValidationError } = require("../error");

function errorHandler(err, req, res, next) {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}

module.exports = { errorHandler };
