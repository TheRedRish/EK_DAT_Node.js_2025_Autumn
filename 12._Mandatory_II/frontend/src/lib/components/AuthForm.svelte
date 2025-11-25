<script>
  let {
    title,
    description,
    email = $bindable(''),
    password = $bindable(''),
    includePassword = true,
    submitLabel = 'Submit',
    loading = false,
    onsubmit = $bindable(() => {})
  } = $props();

  function handleSubmit(event) {
    event.preventDefault();
    onsubmit({ email, password });
  }
</script>

<section class="card">
  <div class="card-header">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>

  <form class="grid" onsubmit={handleSubmit}>
    <label>
      <span>Email</span>
      <input
        type="email"
        bind:value={email}
        placeholder="user@example.com"
        required
      />
    </label>
    {#if includePassword}
      <label>
        <span>Password</span>
        <input
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
        />
      </label>
    {/if}
    <button type="submit" class="primary" disabled={loading}>{submitLabel}</button>
  </form>
</section>
