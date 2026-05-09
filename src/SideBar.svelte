<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fade, slide } from "svelte/transition";

  import SettingsMenu from "./SettingsMenu.svelte";
  import InfoMenu from "./InfoMenu.svelte";
  import {
    activeChatId,
    chats,
    createNewChat,
    deleteChat,
    initializeChatStore,
    selectChat,
  } from "./lib/stores/chat";

  let isSearching = false;
  let myInput: HTMLInputElement | null = null;
  let sideBar = true;
  let searchTerm = "";

  let activeMenu: "info" | "settings" | null = null;

  async function startSearch() {
    isSearching = true;
    await tick();
    myInput?.focus();
  }

  function handleBlur() {
    isSearching = false;
  }

  function toggleSideBar() {
    sideBar = !sideBar;
  }

  async function handleCreateChat() {
    await createNewChat();
  }

  async function openChat(chatId: string) {
    await selectChat(chatId);
  }

  async function removeChat(event: MouseEvent, chatId: string) {
    event.preventDefault();
    event.stopPropagation();
    await deleteChat(chatId);
  }

  $: normalizedSearch = searchTerm.trim().toLowerCase();
  $: visibleChats = normalizedSearch
    ? $chats.filter((chat) =>
        chat.title.toLowerCase().includes(normalizedSearch),
      )
    : $chats;

  onMount(() => {
    void initializeChatStore();
  });
</script>

{#if !sideBar}
  <button
    id="floatingToggle"
    class="iconBtn"
    on:click={toggleSideBar}
    transition:fade={{ duration: 150 }}
  >
    <img
      id="sidebarIcon"
      class="iconImg"
      src="src/images/SideBarToggle.svg"
      alt="Open sidebar"
    />
  </button>
{/if}

{#if sideBar}
  <div
    id="sideBar"
    class:expanded={sideBar}
    transition:slide={{ axis: "x", duration: 300 }}
  >
    <div id="top">
      <button id="logoBtn" class="iconBtn">
        <img id="logo" class="iconImg" src="src/images/Logo.svg" alt="Logo" />
      </button>
      <span class="sectionTitle">RuneChat</span>
      <button id="toggleSide" class="iconBtn" on:click={toggleSideBar}>
        <img
          id="sidebarIcon"
          class="iconImg"
          src="src/images/SideBarToggle.svg"
          alt="Toggle sidebar"
        />
      </button>
    </div>
    <div class="mountingBorder"></div>
    <div id="chatManagment">
      <button id="createChat" class="largeBtn" on:click={handleCreateChat}>
        <div class="btnContent">
          <span class="btnLabel">New Chat</span>
          <img class="iconImg" src="src/images/NewChat.svg" alt="New Chat" />
        </div>
      </button>
      <div class="search-transition-container">
        {#if isSearching}
          <label
            class="SearchLabel"
            in:fade={{ duration: 150 }}
            out:fade={{ duration: 150 }}
          >
            <input
              type="text"
              placeholder="Search Conversations"
              class="searchField"
              bind:this={myInput}
              bind:value={searchTerm}
              on:blur={handleBlur}
            />
          </label>
        {:else}
          <button
            id="searchChats"
            class="largeBtn"
            on:click={startSearch}
            in:fade={{ duration: 150 }}
            out:fade={{ duration: 150 }}
          >
            <div class="btnContent">
              <span class="btnLabel">Search Conversations</span>
              <img
                class="iconImg"
                src="src/images/Search.svg"
                alt="Search Chats"
              />
            </div>
          </button>
        {/if}
      </div>
    </div>
    <div id="chats">
      <span class="sectionTitle">Chats</span>
      <div class="mountingBorder"></div>
      <div id="chatScroll">
        {#if visibleChats.length}
          {#each visibleChats as chat}
            <div class="chatRow">
              <button
                type="button"
                class="chat"
                class:active={chat.id === $activeChatId}
                title={chat.title}
                on:click={() => openChat(chat.id)}
              >
                <span class="chatTitle">{chat.title}</span>
              </button>
              <button
                type="button"
                class="deleteChat"
                aria-label={`Delete ${chat.title}`}
                on:click={(event) => removeChat(event, chat.id)}
              >
                <img
                  src="src/images/Close.svg"
                  alt="Delete chat"
                  class="iconImg closeBtn"
                />
              </button>
            </div>
          {/each}
        {:else}
          <div class="emptyState">
            <span class="chatTitle">
              {normalizedSearch ? "No matching chats" : "No chats yet"}
            </span>
          </div>
        {/if}
      </div>
    </div>
    <div id="footer">
      <button
        id="settings"
        class="iconBtn"
        on:click={() => (activeMenu = "settings")}
      >
        <img class="iconImg" src="src/images/Settings.svg" alt="Settings" />
      </button>
      <button id="info" class="iconBtn" on:click={() => (activeMenu = "info")}>
        <img class="iconImg" src="src/images/Info.svg" alt="Info" />
      </button>
    </div>
  </div>

  {#if activeMenu === "settings"}
    <SettingsMenu open={true} on:close={() => (activeMenu = null)} />
  {/if}

  {#if activeMenu === "info"}
    <InfoMenu open={true} on:close={() => (activeMenu = null)} />
  {/if}
{/if}

<style>
  .iconBtn {
    border: none;
    width: 36px;
    height: 36px;

    background-color: var(--color-bg);
    border-radius: var(--radius-md);

    display: flex;
    align-items: center;
    justify-content: center;

    transition: background-color 0.2s ease;
  }

  .iconBtn:hover {
    background-color: var(--color-bg-hover);
  }

  .iconImg {
    width: 28px;
    height: 28px;
  }

  #sideBar {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    margin: 0;

    height: 100vh;

    width: 0;
    min-width: 0;
    padding: 0;
    opacity: 0;
    pointer-events: none;
    transition:
      width 0.3s ease,
      min-width 0.3s ease,
      padding 0.3s ease,
      opacity 0.2s;
  }

  #sideBar.expanded {
    width: 280px;
    min-width: 280px;
    padding: 0.5rem;
    opacity: 1 !important;
    background-color: var(--color-bg);
    pointer-events: auto;
  }

  #floatingToggle {
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 50;
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  #top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .sectionTitle {
    text-align: center;
    flex: 1;
    font-size: 1.2rem;
    color: var(--color-primary);
  }

  .mountingBorder {
    margin-top: 0.875rem;
    margin-bottom: 0.5rem;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--color-border-muted) 15%,
      var(--color-border-muted) 85%,
      transparent 100%
    );
    opacity: 0.4;
  }

  .largeBtn {
    width: 100%;
    border: solid var(--border-thick) var(--color-primary);
    border-radius: var(--radius-md);
    background-color: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem;
    margin: 1rem 0;
    transition: background-color 0.2s ease;
  }

  .largeBtn:hover {
    background-color: var(--color-bg-hover);
  }

  .btnContent {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btnLabel {
    color: var(--color-primary);
    font-size: 1.2rem;
  }

  .SearchLabel {
    min-height: 53px;
    width: 100%;
    border: solid var(--border-thick) var(--color-primary);
    border-radius: var(--radius-md);
    background-color: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem;
    margin: 1rem 0;
    box-sizing: border-box;
  }

  .searchField {
    width: 100%;
    border: none;
    background: transparent;
    padding: 0;
    outline: none;
    font-size: inherit;
    color: var(--color-primary);
    font-size: 1.2rem;
  }

  .search-transition-container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    margin: 1rem 0;
  }

  .search-transition-container > * {
    grid-column: 1;
    grid-row: 1;
  }

  .largeBtn,
  .SearchLabel {
    margin: 0;
  }

  #chats {
    text-align: center;
    flex: 1;
  }

  #chatScroll {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-height: calc(100vh - 260px);
    overflow-y: auto;
    padding-right: 0.25rem;
  }

  .chatRow {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .chat {
    padding: 0.45rem 0.55rem;
    background: var(--color-bg);
    border-radius: var(--radius-sm);
    text-align: left;
    border: solid var(--border-thin) var(--color-border-muted);
    transition:
      border 0.2s ease,
      background-color 0.2s ease;
    width: 100%;
    cursor: pointer;
  }

  .chat:hover {
    border: solid var(--border-thin) var(--color-primary);
  }

  .chat.active {
    border-color: var(--color-primary);
    background-color: var(--color-bg-hover);
  }

  .chatTitle {
    display: block;
    color: var(--color-primary);
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.95rem;
  }

  .deleteChat {
    border: solid var(--border-thin) var(--color-border-muted);
    background: var(--color-bg);
    color: var(--color-primary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    line-height: 1;
    min-width: 28px;
    min-height: 32px;
    opacity: 0.8;
    transition:
      opacity 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .chatRow:hover .deleteChat {
    opacity: 1;
  }

  .deleteChat:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-hover);
    color: #ef4444;
  }

  .deleteChat:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-hover);
  }

  .emptyState {
    padding: 0.75rem 0.4rem;
    opacity: 0.75;
  }

  #footer {
    display: flex;
    justify-content: space-between;
  }

  #settings img {
    transition: transform 0.4s ease;
  }

  #settings img:hover {
    transform: rotate(90deg);
  }

  .closeBtn {
    width: 24px;
    height: 24px;
  }
</style>
