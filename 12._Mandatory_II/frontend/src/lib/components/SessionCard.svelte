<script>
  export let user = null;
  export let loading = false;
  export let onCheckSession;
  export let onLogout;
</script>

<section class="card status">
  <div class="status-row">
    <div>
      <h2>Session</h2>
      <p>GET /api/auth/session</p>
    </div>
    <div class="actions">
      <button on:click={onCheckSession} disabled={loading}>Check session</button>
      <button on:click={onLogout} disabled={loading || !user}>Logout</button>
    </div>
  </div>

  {#if user}
    <div class="user-box">
      <p><strong>User ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {#if user.created_at}
        <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
      {/if}
    </div>
  {:else}
    <p class="muted">Not authenticated.</p>
  {/if}
</section>
