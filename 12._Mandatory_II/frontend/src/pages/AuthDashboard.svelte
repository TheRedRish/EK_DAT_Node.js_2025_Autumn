<script>
  import { onMount } from 'svelte';
  import {
    registerUser,
    loginUser,
    logoutUser,
    fetchSession,
    fetchSecureMessage,
    fetchEvents,
    requestPasswordReset
  } from '../lib/api';
  import toast from 'svelte-french-toast';
  import AuthForm from '../lib/components/AuthForm.svelte';
  import SessionCard from '../lib/components/SessionCard.svelte';
  import SecureMessageCard from '../lib/components/SecureMessageCard.svelte';
  import EventHistoryCard from '../lib/components/EventHistoryCard.svelte';
  import PageHeader from '../lib/components/PageHeader.svelte';

  let registerEmail = '';
  let registerPassword = '';
  let loginEmail = '';
  let loginPassword = '';
  let forgotEmail = '';
  let user = null;
  let secureMessage = '';
  let events = [];
  let loading = false;

  async function handleRegister(event) {
    const { email, password } = event.detail;
    loading = true;
    const toastId = toast.loading('Registering user...');

    try {
      const { user: newUser } = await registerUser(email, password);
      user = newUser;
      toast.dismiss(toastId);
      toast.success('Registration successful. You are now logged in.');
      registerEmail = '';
      registerPassword = '';
      await Promise.all([loadSecureMessage(), loadEvents()]);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    } finally {
      loading = false;
    }
  }

  async function handleLogin(event) {
    const { email, password } = event.detail;
    loading = true;
    const toastId = toast.loading('Logging in...');

    try {
      const { user: loggedInUser } = await loginUser(email, password);
      user = loggedInUser;
      toast.dismiss(toastId);
      toast.success('Login successful.');
      loginEmail = '';
      loginPassword = '';
      await Promise.all([loadSecureMessage(), loadEvents()]);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    } finally {
      loading = false;
    }
  }

  async function handlePasswordReset(event) {
    const { email } = event.detail;
    loading = true;
    const toastId = toast.loading('Requesting password reset...');

    try {
      await requestPasswordReset(email);
      toast.dismiss(toastId);
      toast.success('Password reset email sent. Check the server logs.');
      forgotEmail = '';
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    } finally {
      loading = false;
    }
  }

  async function handleLogout() {
    loading = true;
    const toastId = toast.loading('Logging out...');

    try {
      await logoutUser();
      user = null;
      secureMessage = '';
      events = [];
      toast.dismiss(toastId);
      toast.success('Logged out successfully.');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    } finally {
      loading = false;
    }
  }

  async function loadSession() {
    try {
      const { user: sessionUser } = await fetchSession();
      user = sessionUser;
      toast.success('Session found. You are signed in.');
      await Promise.all([loadSecureMessage(), loadEvents()]);
    } catch (error) {
      if (error.message === 'Not authenticated') {
        user = null;
        secureMessage = '';
        events = [];
      } else {
        toast.error(error.message);
      }
    }
  }

  async function loadSecureMessage() {
    if (!user) return;
    try {
      const { message } = await fetchSecureMessage();
      secureMessage = message;
    } catch (error) {
      secureMessage = '';
      toast.error(error.message);
    }
  }

  async function loadEvents() {
    if (!user) {
      events = [];
      return;
    }
    try {
      const { events: eventList } = await fetchEvents();
      events = eventList;
    } catch (error) {
      events = [];
      toast.error(error.message);
    }
  }

  onMount(() => {
    loadSession();
  });
</script>

<main class="page">
  <PageHeader />

  <div class="auth-grid">
    <AuthForm
      title="Create account"
      description="POST /api/auth/register"
      bind:email={registerEmail}
      bind:password={registerPassword}
      submitLabel="Register &amp; login"
      {loading}
      bind:onsubmit={handleRegister}
    />

    <AuthForm
      title="Log in"
      description="POST /api/auth/login"
      bind:email={loginEmail}
      bind:password={loginPassword}
      submitLabel="Sign in"
      {loading}
      bind:onsubmit={handleLogin}
    />

    <AuthForm
      title="Forgot password"
      description="POST /api/auth/forgot"
      bind:email={forgotEmail}
      includePassword={false}
      submitLabel="Send reset email"
      {loading}
      bind:onsubmit={handlePasswordReset}
    />
  </div>

  <SessionCard
    {user}
    {loading}
    onCheckSession={loadSession}
    onLogout={handleLogout}
  />

  <SecureMessageCard
    message={secureMessage}
    {loading}
    disabled={!user}
    onLoad={loadSecureMessage}
  />

  <EventHistoryCard
    events={events}
    {loading}
    disabled={!user}
    onRefresh={loadEvents}
  />
</main>
