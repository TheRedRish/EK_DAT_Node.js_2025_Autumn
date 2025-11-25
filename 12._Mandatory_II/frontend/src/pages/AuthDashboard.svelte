<script>
  import { onMount } from 'svelte';
  import {
    registerUser,
    loginUser,
    logoutUser,
    fetchSession,
    fetchSecureMessage,
    fetchEvents
  } from '../lib/api';
  import AuthForm from '../lib/components/AuthForm.svelte';
  import SessionCard from '../lib/components/SessionCard.svelte';
  import SecureMessageCard from '../lib/components/SecureMessageCard.svelte';
  import EventHistoryCard from '../lib/components/EventHistoryCard.svelte';
  import FeedbackPanel from '../lib/components/FeedbackPanel.svelte';
  import PageHeader from '../lib/components/PageHeader.svelte';

  let registerEmail = '';
  let registerPassword = '';
  let loginEmail = '';
  let loginPassword = '';
  let user = null;
  let statusMessage = '';
  let errorMessage = '';
  let secureMessage = '';
  let events = [];
  let loading = false;

  async function handleRegister(event) {
    const { email, password } = event.detail;
    loading = true;
    statusMessage = 'Registering user...';
    errorMessage = '';

    try {
      const { user: newUser } = await registerUser(email, password);
      user = newUser;
      statusMessage = 'Registration successful. You are now logged in.';
      registerEmail = '';
      registerPassword = '';
      await Promise.all([loadSecureMessage(), loadEvents()]);
    } catch (error) {
      statusMessage = '';
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }

  async function handleLogin(event) {
    const { email, password } = event.detail;
    loading = true;
    statusMessage = 'Logging in...';
    errorMessage = '';

    try {
      const { user: loggedInUser } = await loginUser(email, password);
      user = loggedInUser;
      statusMessage = 'Login successful.';
      loginEmail = '';
      loginPassword = '';
      await Promise.all([loadSecureMessage(), loadEvents()]);
    } catch (error) {
      statusMessage = '';
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }

  async function handleLogout() {
    loading = true;
    statusMessage = 'Logging out...';
    errorMessage = '';

    try {
      await logoutUser();
      user = null;
      secureMessage = '';
      events = [];
      statusMessage = 'Logged out successfully.';
    } catch (error) {
      statusMessage = '';
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }

  async function loadSession() {
    try {
      const { user: sessionUser } = await fetchSession();
      user = sessionUser;
      statusMessage = 'Session found. You are signed in.';
      await Promise.all([loadSecureMessage(), loadEvents()]);
    } catch (error) {
      if (error.message === 'Not authenticated') {
        user = null;
        secureMessage = '';
        events = [];
      } else {
        errorMessage = error.message;
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
      errorMessage = error.message;
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
      errorMessage = error.message;
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
      on:submit={handleRegister}
    />

    <AuthForm
      title="Log in"
      description="POST /api/auth/login"
      bind:email={loginEmail}
      bind:password={loginPassword}
      submitLabel="Sign in"
      {loading}
      on:submit={handleLogin}
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

  <FeedbackPanel {statusMessage} {errorMessage} />
</main>
