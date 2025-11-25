<script>
  let { statusMessage = '', errorMessage = '' } = $props();
</script>

{#if statusMessage || errorMessage}
  <section class="card feedback">
    {#if statusMessage}
      <p class="success">{statusMessage}</p>
    {/if}
    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}
  </section>
{/if}
