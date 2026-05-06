<script lang="ts">
  import { renderMarkdown } from "./lib/markdown";
  import Input from "./Input.svelte";

  type Role = "user" | "assistant";

  interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: string;
  }

  interface Chat {
    id: string;
    title: string;
    messages: Message[];
  }

  const chat: Chat = {
    id: "chat_2",
    title: "Python Rock Paper Scissors",
    messages: [
      {
        id: "m1",
        role: "user",
        content:
          "hey so i want to make a rock paper scissors game in python but i have no idea where to start, ive done like a tiny bit of python before but nothing like a real game",
        timestamp: "2026-05-05T10:12:00Z",
      },
      {
        id: "m2",
        role: "assistant",
        content: `That's a great project to work on — rock paper scissors is actually a perfect beginner game because it's simple enough to finish, but teaches you a bunch of useful concepts along the way.

Here's the basic idea of what we'll need:

1. **Get the player's choice** — ask them to type "rock", "paper", or "scissors"
2. **Make the computer pick randomly** — Python has a built-in tool for this
3. **Compare the two choices** — figure out who wins
4. **Show the result** — print something like "You win!" or "Computer wins!"

Let's start with a simple version. Paste this into a file called \`rps.py\` and run it:

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

Try running that and let me know what happens! Once it's working we can add more to it.`,
        timestamp: "2026-05-05T10:12:08Z",
      },
      {
        id: "m3",
        role: "user",
        content:
          "ok that worked!! but like what if the user types Rock with a capital R or something it just says computer wins which is wrong lol, also is there a way to make it keep playing instead of closing right away",
        timestamp: "2026-05-05T10:18:45Z",
      },
      {
        id: "m4",
        role: "assistant",
        content: `Good catch on both of those — they're really common things to run into!

**Fix 1: Capital letters**

We can fix that with \`.lower()\`, which just converts whatever the user types to lowercase before we check it. So "Rock", "ROCK", and "rock" all become "rock":

\`\`\`python
player = input("Enter rock, paper, or scissors: ").lower()
\`\`\`

That one line change handles it.

**Fix 2: Keep playing in a loop**

For this we'll wrap the whole game in a \`while\` loop. The game keeps going until the player decides to quit:

\`\`\`python
import random

choices = ["rock", "paper", "scissors"]

while True:
    player = input("Enter rock, paper, or scissors (or 'quit' to exit): ").lower()

    if player == "quit":
        print("Thanks for playing!")
        break

    if player not in choices:
        print("That's not a valid choice, try again.")
        continue

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

    print("---")
\`\`\`

I also snuck in a check for invalid input — if someone types "banana" it'll just ask again instead of crashing. Give this version a try!`,
        timestamp: "2026-05-05T10:18:52Z",
      },
      {
        id: "m5",
        role: "user",
        content:
          "this is so cool omg, one last thing can it keep track of the score like how many times i won vs the computer? and then show it when i quit",
        timestamp: "2026-05-05T10:27:30Z",
      },
      {
        id: "m6",
        role: "assistant",
        content: `Absolutely — score tracking is easier than it sounds. We just create a couple of variables to count wins and losses, then add 1 to the right one after each round.

Here's the final version with everything included:

\`\`\`python
import random

choices = ["rock", "paper", "scissors"]
player_wins = 0
computer_wins = 0
ties = 0

while True:
    player = input("Enter rock, paper, or scissors (or 'quit' to exit): ").lower()

    if player == "quit":
        print("\\n--- Final Score ---")
        print(f"You: {player_wins}")
        print(f"Computer: {computer_wins}")
        print(f"Ties: {ties}")
        print("Thanks for playing!")
        break

    if player not in choices:
        print("That's not a valid choice, try again.")
        continue

    computer = random.choice(choices)
    print(f"Computer chose: {computer}")

    if player == computer:
        print("It's a tie!")
        ties += 1
    elif (player == "rock" and computer == "scissors") or \
         (player == "scissors" and computer == "paper") or \
         (player == "paper" and computer == "rock"):
        print("You win!")
        player_wins += 1
    else:
        print("Computer wins!")
        computer_wins += 1

    print(f"Score — You: {player_wins} | Computer: {computer_wins} | Ties: {ties}")
    print("---")
\`\`\`

The key additions:
- **Three counters** — \`player_wins\`, \`computer_wins\`, and \`ties\` start at 0
- **\`+= 1\`** adds 1 to the right counter after each round
- The score prints after every round so you can always see where you stand
- When you type "quit", it shows the full final summary before closing

That's a complete, working game — you should be really proud of this one. If you ever want to keep going, some fun next steps would be adding a best-of-5 mode, or letting two players go head to head instead of playing against the computer.`,
        timestamp: "2026-05-05T10:27:41Z",
      },
    ],
  };
</script>

<section class="chat-container">
  <div class="messages">
    {#each chat.messages as message (message.id)}
      <div class="message-wrapper {message.role}">
        <div class="message-bubble">
          {@html renderMarkdown(message.content)}
        </div>
      </div>
    {/each}
  </div>
  <div class="input-area">
    <Input />
  </div>
</section>

<style>
  /* ─── Layout ─── */
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

  /* ─── Message positioning ─── */
  .message-wrapper {
    display: flex;
    width: 100%;
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message-wrapper.assistant {
    justify-content: flex-start;
  }

  /* ─── The actual bubble ─── */
  .message-bubble {
    max-width: 75%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    font-size: 0.9375rem; /* ~15px, comfortable for chat */
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }

  .user {
    margin-top: 4rem;
  }

  .user .message-bubble {
    background: #c41e3a; /* your RuneChat red */
    color: white;
    border-bottom-right-radius: 0.25rem; /* speech bubble tail effect */
  }

  .assistant .message-bubble {
    background: white;
    color: #1a1a1a;
    border-bottom-left-radius: 0.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  /* ─── Markdown styling INSIDE bubbles ─── */
  .message-bubble :global(h1),
  .message-bubble :global(h2),
  .message-bubble :global(h3) {
    margin: 0.5rem 0 0.25rem;
    font-size: 1.05em;
    font-weight: 600;
  }

  .message-bubble :global(p) {
    margin: 0.35rem 0;
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
