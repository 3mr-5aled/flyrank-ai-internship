async function signUp(supaBase, { email, password }) {
  const { data, error } = await supaBase.auth.signUp({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data;
}

async function signIn(supaBase, { email, password }) {
  const { data, error } = await supaBase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data;
}

async function refreshSession(supaBase, refresh_token) {
  const { data, error } = await supaBase.auth.refreshSession({
    refresh_token,
  });
  if (error) {
    throw error;
  }
  return data;
}

module.exports = {
  signUp,
  signIn,
  refreshSession,
};
