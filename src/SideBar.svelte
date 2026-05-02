<script lang="ts">
  import { tick } from "svelte";
  import { fade, slide } from "svelte/transition";

  let isSearching = false;
  let myInput;
  let sideBar = true;

  async function startSearch() {
    isSearching = true;
    await tick();
    myInput.focus();
  }

  function handleBlur() {
    isSearching = false;
  }

  function toggleSideBar() {
    sideBar = !sideBar;
  }

  let chats = [
    { title: "Greetings" },
    { title: "Project Ideas" },
    { title: "Cheapest Places to Live" },
    { title: "Testing Testing " },
  ];
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
      <span>RuneChat</span>
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
      <button id="createChat" class="largeBtn">
        <div class="btnContent">
          <span>New Chat</span>
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
              <span>Search Conversations</span>
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
      <span>Chats</span>
      <div class="mountingBorder"></div>
      <div id="chatScroll">
        {#each chats as chat}
          <a href="#404" class="link">
            <div class="chat">
              <span>{chat.title}</span>
            </div>
          </a>
        {/each}
      </div>
    </div>
    <div id="footer">
      <button id="settings" class="iconBtn">
        <img class="iconImg" src="src/images/Settings.svg" alt="Settings" />
      </button>
      <button id="info" class="iconBtn">
        <img class="iconImg" src="src/images/Info.svg" alt="Info" />
      </button>
    </div>
  </div>
{/if}

<style>
  .iconBtn {
    border: none;
    width: 36px;
    height: 36px;

    background-color: #ffffff;
    border-radius: 5px;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: background-color 0.2s ease;
  }

  .iconBtn:hover {
    background-color: #e2e2e2;
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
    background-color: #ffffff;
    pointer-events: auto;
  }

  #floatingToggle {
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 50;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  #top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  span {
    text-align: center;
    flex: 1;
    font-size: 1.2rem;
    color: #a51c30;
  }

  .mountingBorder {
    margin-top: 0.875rem;
    margin-bottom: 0.5rem;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #78716c 15%,
      #78716c 85%,
      transparent 100%
    );
    opacity: 0.4;
  }

  .largeBtn {
    width: 100%;
    border: solid 3px #a51c30;
    border-radius: 5px;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem;
    margin: 1rem 0;
    transition: background-color 0.2s ease;
  }

  .largeBtn:hover {
    background-color: #e2e2e2;
  }

  .btnContent {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .SearchLabel {
    min-height: 53px;
    width: 100%;
    border: solid 3px #a51c30;
    border-radius: 5px;
    background-color: #ffffff;
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
    color: #a51c30;
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

  .chat {
    padding: 0.3rem;
    margin: 0.3rem;
    background: #ffffff;
    border-radius: 3px;
    text-align: left;
    border: solid 1px #ffffff;
    transition: border 0.2s ease;
  }

  .link {
    text-decoration: none;
  }

  .chat:hover {
    border: solid 1px #a51c30;
  }

  .chat span {
    color: #a51c30;
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
</style>
