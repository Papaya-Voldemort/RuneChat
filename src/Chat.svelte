<script lang="ts">
  import { renderMarkdown } from "./lib/functions/markdown";
  import Input from "./Input.svelte";
  import { messages } from "./lib/stores/chat";

  const initialMessages = [
    {
      id: "m1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "hey so i want to make a rock paper scissors game in python but i have no idea where to start, ive done like a tiny bit of python before but nothing like a real game",
        },
      ],
      timestamp: "2026-05-05T10:12:00Z",
    },
    {
      id: "m2",
      role: "assistant",
      parts: [
        { type: "reasoning", text: "I am thining hard about this one!" },
        {
          type: "text",
          text: `That's a great project to work on — rock paper scissors is actually a perfect beginner game because it's simple enough to finish, but teaches you a bunch of useful concepts along the way.

Here's the basic idea of what we'll need:

1. Get the player's choice — ask them to type "rock", "paper", or "scissors"
2. Make the computer pick randomly
3. Compare the two choices
4. Show the result

Let's start with a simple version:

\`\`\`python
import random

choices = ["rock", "paper", "scissors"]

player = input("Enter rock, paper, or scissors: ")
computer = random.choice(choices)

print(f"Computer chose: {computer}")

if player == computer:
    print("It's a tie!")
elif (player == "rock" and computer == "scissors") or \
     (player == "scissors" and computer == "paper") or \
     (player == "paper" and computer == "rock"):
    print("You win!")
else:
    print("Computer wins!")
\`\`\`

Try running it and we can upgrade it next.`,
        },
      ],
      timestamp: "2026-05-05T10:12:08Z",
    },
    {
      id: "m3",
      role: "user",
      parts: [
        {
          type: "text",
          text: "ok that worked!! but like what if the user types Rock with a capital R or something it just says computer wins which is wrong lol, also is there a way to make it keep playing instead of closing right away",
        },
      ],
      timestamp: "2026-05-05T10:18:45Z",
    },
    {
      id: "m4",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `Good catch on both — super common issues.

Fix capitalization with:

\`\`\`python
player = input("Enter rock, paper, or scissors: ").lower()
\`\`\`

Then wrap everything in a loop:

\`\`\`python
import random

choices = ["rock", "paper", "scissors"]

while True:
    player = input("Enter rock, paper, or scissors (or 'quit'): ").lower()

    if player == "quit":
        print("Thanks for playing!")
        break

    if player not in choices:
        print("Invalid choice")
        continue

    computer = random.choice(choices)
    print(f"Computer chose: {computer}")

    if player == computer:
        print("Tie!")
    elif (player == "rock" and computer == "scissors") or \
         (player == "scissors" and computer == "paper") or \
         (player == "paper" and computer == "rock"):
        print("You win!")
    else:
        print("Computer wins!")
\`\`\``,
        },
      ],
      timestamp: "2026-05-05T10:18:52Z",
    },
    {
      id: "m5",
      role: "user",
      parts: [
        {
          type: "text",
          text: "this is so cool omg, can it track score too?",
        },
      ],
      timestamp: "2026-05-05T10:27:30Z",
    },
    {
      id: "m6",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `Yep — just add counters:

\`\`\`python
import random

choices = ["rock", "paper", "scissors"]
player_wins = 0
computer_wins = 0
ties = 0

while True:
    player = input("Enter rock, paper, or scissors (or 'quit'): ").lower()

    if player == "quit":
        print("\\nFinal Score")
        print(f"You: {player_wins}")
        print(f"Computer: {computer_wins}")
        print(f"Ties: {ties}")
        break

    if player not in choices:
        print("Invalid choice")
        continue

    computer = random.choice(choices)
    print(f"Computer chose: {computer}")

    if player == computer:
        ties += 1
    elif (player == "rock" and computer == "scissors") or \
         (player == "scissors" and computer == "paper") or \
         (player == "paper" and computer == "rock"):
        player_wins += 1
    else:
        computer_wins += 1

    print(f"You: {player_wins} | Computer: {computer_wins} | Ties: {ties}")
\`\`\``,
        },
      ],
      timestamp: "2026-05-05T10:27:41Z",
    },
  ];

  messages.set(initialMessages);

  async function copyBtn(message: any) {
    try {
      const text = message.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("\n");
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
</script>

<section class="chat-container">
  <div class="messages">
    {#each $messages as message (message.id)}
      <div class="message-wrapper {message.role}">
        {#if message.parts?.length}
          {#if message.parts.some((p) => p.type === "reasoning")}
            <div class="thinking">
              {message.parts
                .filter((p) => p.type === "reasoning")
                .map((p) => p.text)
                .join("")}
            </div>
          {/if}

          <div class="message-bubble">
            {@html renderMarkdown(
              message.parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join(""),
            )}
          </div>
        {:else}
          <div class="message-bubble">
            {@html renderMarkdown(message.content ?? "")}
          </div>
        {/if}

        <div class="options">
          <button class="iconBtn" on:click={() => copyBtn(message)}>
            <img
              src="src/images/Copy.svg"
              alt="Copy Contents"
              class="iconImg"
            />
          </button>
        </div>
      </div>
    {/each}
  </div>
  <div class="input-area">
    <Input />
  </div>
</section>

<style>
  .iconBtn {
    border: none;
    width: 28px;
    height: 28px;
    background: transparent;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.4;
    transition:
      opacity 0.15s ease,
      background-color 0.15s ease;
    cursor: pointer;
  }

  .iconBtn:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.06);
  }

  .iconImg {
    width: 16px;
    height: 16px;
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;

    background: inherit;
    min-width: 0;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-bottom: 4rem;
    scrollbar-width: none;
    gap: 1rem;
  }

  .input-area {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    background: transparent;
    z-index: 20;
  }

  .message-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: flex-end;
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message-wrapper.assistant {
    align-items: flex-start;
  }

  .thinking {
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 75%;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .message-wrapper:hover .thinking {
    opacity: 1;
  }

  .message-wrapper.assistant {
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .thinking {
    max-width: 85%;
    font-size: 0.8rem;
    line-height: 1.4;
    color: #999;
    padding: 0.2rem 0 0.2rem 0.6rem;
    margin: 0 0 0.15rem 0;
    border-left: 2px solid #e0e0e0;
    border-radius: 0;
    background: transparent;
    opacity: 0.7;
  }

  .assistant .message-bubble {
    margin-top: 0.35rem;
  }

  .message-wrapper.assistant:hover .thinking {
    opacity: 0.9;
    border-left-color: #ccc;
  }

  .options {
    margin-top: 0.25rem;
  }

  .message-wrapper .options {
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .message-wrapper:hover .options {
    opacity: 1;
  }

  .message-bubble {
    max-width: 75%;
    padding: 0.45rem 0.85rem;
    border-radius: 1rem;
    font-size: 0.9375rem;
    line-height: 1.25;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .user .message-bubble {
    background: #c41e3a;
    color: white;
    border-bottom-right-radius: 0.25rem;
  }

  .assistant .message-bubble {
    background: white;
    color: #1a1a1a;
    border-bottom-left-radius: 0.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .message-bubble :global(h1),
  .message-bubble :global(h2),
  .message-bubble :global(h3) {
    margin: 0.5rem 0 0.25rem;
    font-size: 1.05em;
    font-weight: 600;
  }

  .message-bubble :global(p) {
    margin: 0.2rem 0;
  }

  .message-bubble :global(p:first-child) {
    margin-top: 0;
  }

  .message-bubble :global(p:last-child) {
    margin-bottom: 0;
  }

  .message-bubble :global(ul),
  .message-bubble :global(ol) {
    margin: 0.35rem 0;
    padding-left: 1.25rem;
  }

  .message-bubble :global(li) {
    margin: 0.15rem 0;
  }

  .message-bubble :global(pre) {
    background: rgba(0, 0, 0, 0.06);
    padding: 0.6rem 0.75rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    font-size: 0.85em;
    line-height: 1.4;
    margin: 0.5rem 0;
  }

  .message-bubble :global(code) {
    font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
  }

  .message-bubble :global(p code) {
    background: rgba(0, 0, 0, 0.06);
    padding: 0.15rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }

  .message-bubble :global(blockquote) {
    margin: 0.5rem 0;
    padding-left: 0.75rem;
    border-left: 3px solid #c41e3a;
    color: #555;
    font-style: italic;
  }

  .message-bubble :global(hr) {
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin: 0.75rem 0;
  }

  .message-bubble :global(a) {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .user .message-bubble :global(pre),
  .user .message-bubble :global(p code) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .user .message-bubble :global(blockquote) {
    border-left-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.9);
  }
</style>
