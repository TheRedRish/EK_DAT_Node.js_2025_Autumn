<script>
  let { user = null, loading = false, onCheckSession, onLogout } = $props();
</script>

<section class="card status">
  <div class="status-row">
    <div>
      <h2>Session</h2>
      <p>GET /api/auth/session</p>
    </div>
    <div class="actions">
      <button onclick={onCheckSession} disabled={loading}>Check session</button>
      <button onclick={onLogout} disabled={loading || !user}>Logout</button>
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
