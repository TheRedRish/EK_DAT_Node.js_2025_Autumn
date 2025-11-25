<script>
  let { message = '', loading = false, disabled = false, onLoad } = $props();
</script>

<section class="card">
  <div class="status-row">
    <div>
      <h2>Secure message</h2>
      <p>GET /api/secure/message</p>
    </div>
    <div class="actions">
      <button onclick={onLoad} disabled={loading || disabled}>Load message</button>
    </div>
  </div>
  {#if message}
    <p class="message">{message}</p>
  {:else}
    <p class="muted">Log in to see the personalized message.</p>
  {/if}
</section>
