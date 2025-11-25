<script>
  import { createEventDispatcher } from 'svelte';

  export let title;
  export let description;
  export let email = '';
  export let password = '';
  export let submitLabel = 'Submit';
  export let loading = false;

  const dispatch = createEventDispatcher();

  function handleSubmit(event) {
    event.preventDefault();
    dispatch('submit', { email, password });
  }
</script>

<section class="card">
  <div class="card-header">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>

  <form class="grid" on:submit={handleSubmit}>
    <label>
      <span>Email</span>
      <input
        type="email"
        bind:value={email}
        placeholder="user@example.com"
        required
      />
    </label>
    <label>
      <span>Password</span>
      <input
        type="password"
        bind:value={password}
        placeholder="••••••••"
        required
      />
    </label>
    <button type="submit" class="primary" disabled={loading}>{submitLabel}</button>
  </form>
</section>
