<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  const API_BASE = 'http://localhost:4000/api';

  const user = writable(null);
  const currentRoute = writable(getRoute());
  const notifications = writable([]);
  const secureMessage = writable('');
  const loginEvents = writable([]);

  let loginEmail = '';
  let loginPassword = '';
  let registerEmail = '';
  let registerPassword = '';
  let isLoading = false;

  function getRoute() {
    return window.location.hash.replace('#', '') || '/';
  }

  function navigate(path) {
    window.location.hash = path;
  }

  window.addEventListener('hashchange', () => {
    currentRoute.set(getRoute());
  });

  function pushNotification(type, message) {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    notifications.update((items) => [...items, { id, type, message }]);
    setTimeout(() => {
      notifications.update((items) => items.filter((note) => note.id !== id));
    }, 3500);
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      credentials: 'include',
      ...options
    });
    return response;
  }

  async function loadSession() {
    try {
      const res = await request('/auth/me');
      if (res.ok) {
        const data = await res.json();
        user.set(data.user);
      }
    } catch (error) {
      console.error('Could not restore session', error);
    }
  }

  async function handleRegister() {
    isLoading = true;
    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: registerEmail, password: registerPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        pushNotification('error', data.error || 'Registration failed');
        return;
      }

      user.set(data.user);
      pushNotification('success', 'Account created and logged in');
      navigate('/dashboard');
      await loadProtectedResources();
    } catch (error) {
      console.error(error);
      pushNotification('error', 'Could not register right now');
    } finally {
      isLoading = false;
    }
  }

  async function handleLogin() {
    isLoading = true;
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        pushNotification('error', data.error || 'Login failed');
        return;
      }

      user.set(data.user);
      pushNotification('success', 'Welcome back!');
      navigate('/dashboard');
      await loadProtectedResources();
    } catch (error) {
      console.error(error);
      pushNotification('error', 'Could not log in');
    } finally {
      isLoading = false;
    }
  }

  async function handleLogout() {
    await request('/auth/logout', { method: 'POST' });
    user.set(null);
    secureMessage.set('');
    loginEvents.set([]);
    navigate('/');
    pushNotification('success', 'You have been signed out');
  }

  async function loadProtectedResources() {
    const [messageRes, eventsRes] = await Promise.all([
      request('/secure/message'),
      request('/auth/events')
    ]);

    if (messageRes.ok) {
      const data = await messageRes.json();
      secureMessage.set(data.message);
    }

    if (eventsRes.ok) {
      const data = await eventsRes.json();
      loginEvents.set(data.events);
    }
  }

  $: if ($currentRoute === '/dashboard' && !$user) {
    pushNotification('warning', 'Please sign in to view the dashboard');
    navigate('/');
  }

  $: if ($currentRoute === '/dashboard' && $user) {
    loadProtectedResources();
  }

  onMount(() => {
    loadSession();
    if (getRoute() === '/dashboard') {
      navigate('/');
    }
  });
</script>

<svelte:window on:keydown={(event) => event.key === 'Escape' && navigate('/')} />

<main>
  <header class="hero">
    <div>
      <p class="eyebrow">Mandatory II</p>
      <h1>Secure Svelte Auth</h1>
      <p class="lede">Fullstack authentication powered by sessions, hashed passwords and protected routes.</p>
      <div class="hero-actions">
        <button class="primary" on:click={() => navigate('/dashboard')} disabled={!$user}>Dashboard</button>
        <button class="ghost" on:click={() => navigate('/')}>Home</button>
      </div>
    </div>
    {$user ? (
      <div class="session-card">
        <p class="muted">Signed in as</p>
        <p class="bold">{$user.email}</p>
        <button class="secondary" on:click={handleLogout}>Sign out</button>
      </div>
    ) : (
      <div class="session-card">
        <p class="bold">No active session</p>
        <p class="muted">Sign in to unlock protected content.</p>
      </div>
    )}
  </header>

  {#if $currentRoute === '/'}
    <section class="grid">
      <article class="panel">
        <p class="eyebrow">Authenticate</p>
        <h2>Log in</h2>
        <form class="stack" on:submit|preventDefault={handleLogin}>
          <label>
            <span>Email</span>
            <input type="email" bind:value={loginEmail} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" bind:value={loginPassword} required />
          </label>
          <button class="primary" type="submit" disabled={isLoading}>Log in</button>
        </form>
      </article>

      <article class="panel">
        <p class="eyebrow">Register</p>
        <h2>Create account</h2>
        <form class="stack" on:submit|preventDefault={handleRegister}>
          <label>
            <span>Email</span>
            <input type="email" bind:value={registerEmail} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" bind:value={registerPassword} required minlength="6" />
          </label>
          <button class="secondary" type="submit" disabled={isLoading}>Register & sign in</button>
          <p class="muted small">A simulated welcome email is printed from the backend.</p>
        </form>
      </article>
    </section>

    <section class="panel">
      <p class="eyebrow">How it works</p>
      <div class="list">
        <div>
          <h3>Sessions & hashing</h3>
          <p>Passwords are hashed with bcryptjs and sessions keep you logged in with httpOnly cookies.</p>
        </div>
        <div>
          <h3>Protected endpoints</h3>
          <p>Backend routes such as <code>/api/secure/message</code> reject unauthenticated requests.</p>
        </div>
        <div>
          <h3>Notifications</h3>
          <p>Toast-style notifications confirm login state changes and backend responses.</p>
        </div>
      </div>
    </section>
  {:else if $currentRoute === '/dashboard'}
    <section class="panel">
      <p class="eyebrow">Private area</p>
      <h2>Dashboard</h2>
      <p class="lede">Only visible when your session is active.</p>
      <div class="card-grid">
        <div class="tile">
          <p class="muted">Personal message</p>
          <p class="bold">{ $secureMessage || 'Loading secure message...' }</p>
        </div>
        <div class="tile">
          <p class="muted">Account email</p>
          <p class="bold">{$user?.email}</p>
        </div>
      </div>
      <div class="events">
        <h3>Recent security events</h3>
        {#if $loginEvents.length === 0}
          <p class="muted">No events tracked yet.</p>
        {:else}
          <ul>
            {#each $loginEvents as event}
              <li>
                <span class="pill">{event.type}</span>
                <span>{new Date(event.created_at).toLocaleString()}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>
  {/if}
</main>

<div class="notifications">
  {#each $notifications as note}
    <div class={`toast ${note.type}`}>
      <strong>{note.type}</strong>
      <p>{note.message}</p>
    </div>
  {/each}
</div>
