<script lang="ts">
</script>

<div class="chat-input">
  <input
    type="text"
    name="input"
    id="input"
    placeholder="Type a message..."
  />

  <button class="send-btn">
    <img
      src="src/images/SendMessage.svg"
      alt="Send Message"
    />
  </button>
</div>

<style>
  .chat-input {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 10px 12px;

    background: var(--color-bg);
    border: var(--border-thin) solid var(--color-border-muted);
    border-radius: var(--radius-md);

    box-shadow: 0 2px 6px var(--color-shadow);

    width: 100%;
    max-width: 600px;
  }

  .chat-input input {
    flex: 1;

    border: none;
    outline: none;
    background: transparent;

    font-size: 14px;
    color: #222;
  }

  .chat-input input::placeholder {
    color: #999;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    border-radius: var(--radius-sm);
    border: var(--border-thin) solid var(--color-border-muted);

    background: var(--color-bg);
    cursor: pointer;

    transition: all 0.15s ease;
  }

  .send-btn:hover {
    background: var(--color-bg-hover);
  }

  .send-btn:active {
    transform: scale(0.95);
  }

  .send-btn img {
    width: 18px;
    height: 18px;
  }

  /* .chat-input:focus-within {
    border: var(--border-thick) solid var(--color-primary);
  } */
</style>