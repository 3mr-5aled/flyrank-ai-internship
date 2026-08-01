const repo = require("../repositories/auth.repository");
const { ValidationError } = require("../error");

async function registerUser(supabase, body = {}) {
  const { email, password } = body;
  if (
    !email ||
    !password ||
    !String(email).trim() ||
    !String(password).trim()
  ) {
    throw new ValidationError("Email and password are required");
  }
  return await repo.signUp(supabase, {
    email: String(email).trim(),
    password: String(password).trim(),
  });
}

async function loginUser(supabase, body = {}) {
  const { email, password } = body;
  if (
    !email ||
    !password ||
    !String(email).trim() ||
    !String(password).trim()
  ) {
    throw new ValidationError("Email and password are required");
  }

  try {
    const data = await repo.signIn(supabase, {
      email: String(email).trim(),
      password: String(password).trim(),
    });
    if (!data || !data.session) {
      const authError = new Error("Invalid login credentials");
      authError.status = 401;
      throw authError;
    }
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    const authError = new Error("Invalid login credentials");
    authError.status = 401;
    throw authError;
  }
}

module.exports = {
  registerUser,
  loginUser,
};
