/**
 * Centralised validation helpers.
 * All functions return { valid: boolean, errors: string[] }.
 */

/**
 * Validates a task title.
 * - Must be present
 * - Must be a non-empty string after trimming
 * - Max 200 characters
 */
function validateTitle(title) {
  const errors = [];
  if (title === undefined || title === null) {
    errors.push('"title" is required.');
  } else if (typeof title !== "string") {
    errors.push('"title" must be a string.');
  } else if (title.trim().length === 0) {
    errors.push('"title" must not be blank.');
  } else if (title.trim().length > 200) {
    errors.push('"title" must be at most 200 characters.');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates the "done" field.
 * - Must be present
 * - Must be a boolean
 */
function validateDone(done) {
  const errors = [];
  if (done === undefined || done === null) {
    errors.push('"done" is required.');
  } else if (typeof done !== "boolean") {
    errors.push('"done" must be a boolean (true or false).');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a route parameter that is expected to be a positive integer.
 * @param {string} raw - the raw string from req.params
 * @param {string} name - field name to include in error messages
 */
function validatePositiveIntParam(raw, name = "id") {
  const errors = [];
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    errors.push(`"${name}" must be a positive integer.`);
  }
  return { valid: errors.length === 0, errors, value: parsed };
}

/**
 * Validates and coerces pagination query params.
 * Returns { page, limit } as numbers, or an errors array.
 */
function validatePagination(rawPage, rawLimit) {
  const errors = [];
  let page = parseInt(rawPage, 10);
  let limit = parseInt(rawLimit, 10);

  if (rawPage !== undefined) {
    if (isNaN(page) || page < 1) errors.push('"page" must be a positive integer.');
  } else {
    page = 1;
  }

  if (rawLimit !== undefined) {
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('"limit" must be an integer between 1 and 100.');
    }
  } else {
    limit = 10;
  }

  return { valid: errors.length === 0, errors, page, limit };
}

module.exports = {
  validateTitle,
  validateDone,
  validatePositiveIntParam,
  validatePagination,
};
