<script>
  let { events = [], loading = false, disabled = false, onRefresh } = $props();
</script>

<section class="card">
  <div class="status-row">
    <div>
      <h2>Recent login activity</h2>
      <p>GET /api/auth/events</p>
    </div>
    <div class="actions">
      <button onclick={onRefresh} disabled={loading || disabled}>Refresh</button>
    </div>
  </div>
  {#if events.length}
    <ul class="event-list">
      {#each events as event (event.created_at)}
        <li>
          <span class="pill">{event.type}</span>
          <span>{new Date(event.created_at).toLocaleString()}</span>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="muted">No login events to show yet.</p>
  {/if}
</section>
