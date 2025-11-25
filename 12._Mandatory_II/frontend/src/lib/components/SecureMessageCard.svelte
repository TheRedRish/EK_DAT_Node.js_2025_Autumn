<script>
  export let message = '';
  export let loading = false;
  export let disabled = false;
  export let onLoad;
</script>

<section class="card">
  <div class="status-row">
    <div>
      <h2>Secure message</h2>
      <p>GET /api/secure/message</p>
    </div>
    <div class="actions">
      <button on:click={onLoad} disabled={loading || disabled}>Load message</button>
    </div>
  </div>
  {#if message}
    <p class="message">{message}</p>
  {:else}
    <p class="muted">Log in to see the personalized message.</p>
  {/if}
</section>
