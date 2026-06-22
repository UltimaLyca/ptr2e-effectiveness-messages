// Effectiveness Messages for PTR2e
// Displays classic Pokemon-style messages like "It's super effective!" when damage is dealt

const MODULE_ID = "effectiveness-messages";

// Sound effect paths
const SOUNDS = {
  superEffective: `modules/${MODULE_ID}/sounds/super-effective.ogg`,
  notVeryEffective: `modules/${MODULE_ID}/sounds/not-very-effective.ogg`,
  immune: `modules/${MODULE_ID}/sounds/immune.ogg`
};

// CSS styles injected into the page
const STYLES = `
<style id="${MODULE_ID}-styles">
  .effectiveness-message {
    text-align: center;
    padding: 2px 6px;
    margin: 4px 0;
    border-radius: 3px;
    font-size: 0.9em;
  }
  .effectiveness-super {
    color: #2d5016;
    background: linear-gradient(90deg, transparent, rgba(100, 200, 100, 0.3), transparent);
    font-weight: bold;
  }
  .effectiveness-resist {
    color: #6b3030;
    background: linear-gradient(90deg, transparent, rgba(200, 100, 100, 0.2), transparent);
  }
  .effectiveness-immune {
    color: #555;
    background: linear-gradient(90deg, transparent, rgba(128, 128, 128, 0.2), transparent);
    font-style: italic;
  }
  .effectiveness-multiplier {
    font-size: 0.85em;
    opacity: 0.8;
    margin-left: 4px;
  }
</style>
`;

Hooks.once("init", () => {
  // Register module settings
  game.settings.register(MODULE_ID, "enabled", {
    name: "Enable Effectiveness Messages",
    hint: "Show 'It's super effective!' and similar messages when damage is dealt",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "showMultiplier", {
    name: "Show Damage Multiplier",
    hint: "Display the effectiveness multiplier (×2, ×0.5, etc.) alongside the message",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "playSounds", {
    name: "Play Sound Effects",
    hint: "Play sound effects with effectiveness messages (requires sound files in module sounds folder)",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, "soundVolume", {
    name: "Sound Volume",
    hint: "Volume for effectiveness sound effects (0-1)",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 1, step: 0.1 },
    default: 0.5
  });

  console.log(`${MODULE_ID} | Initializing...`);
});

Hooks.once("ready", () => {
  // Inject styles
  if (!document.getElementById(`${MODULE_ID}-styles`)) {
    document.head.insertAdjacentHTML("beforeend", STYLES);
  }

  console.log(`${MODULE_ID} | Effectiveness Messages loaded`);
});

Hooks.on("renderChatMessage", (message, html, data) => {
  if (!game.settings.get(MODULE_ID, "enabled")) return;

  // Only process PTR2e attack messages
  if (message.type !== "attack") return;

  // The render context is populated during getHTMLContent() and contains damageRoll
  const context = message.system?.context;
  if (!context?.results) return;

  // context.results is a Map<ActorUUID, AttackMessageRenderContextData>
  const resultsMap = context.results;
  if (!(resultsMap instanceof Map) || resultsMap.size === 0) return;

  // Track if we've played a sound this message (play highest priority only)
  let soundToPlay = null;
  let soundPriority = 0; // 0=none, 1=resist, 2=super, 3=immune

  // Get the HTML element (Foundry v14 passes native element, not jQuery)
  const htmlElement = html instanceof HTMLElement ? html : html[0];
  if (!htmlElement) return;

  // Find the target rows in the chat card
  const targetRows = htmlElement.querySelectorAll(".target[data-target-uuid]");
  const showMultiplier = game.settings.get(MODULE_ID, "showMultiplier");

  for (const [targetUuid, result] of resultsMap) {
    // Get effectiveness from damage context
    // damageRoll.context.type contains the type effectiveness multiplier
    const effectiveness = result.damageRoll?.context?.type ?? 1;
    const targetName = result.target?.name ?? "the target";

    // Skip normal effectiveness
    if (effectiveness === 1) continue;

    // Determine message and styling
    let messageText, messageClass, sound, priority;

    // Format multiplier for display (e.g., "×2", "×0.5", "×4")
    const multiplierHtml = showMultiplier
      ? `<span class="effectiveness-multiplier">(×${effectiveness})</span>`
      : "";

    if (effectiveness === 0) {
      messageText = `It doesn't affect ${targetName}...`;
      messageClass = "effectiveness-immune";
      sound = SOUNDS.immune;
      priority = 3;
    } else if (effectiveness < 1) {
      messageText = `It's not very effective... ${multiplierHtml}`;
      messageClass = "effectiveness-resist";
      sound = SOUNDS.notVeryEffective;
      priority = 1;
    } else if (effectiveness > 1) {
      messageText = `It's super effective! ${multiplierHtml}`;
      messageClass = "effectiveness-super";
      sound = SOUNDS.superEffective;
      priority = 2;
    } else {
      continue;
    }

    // Track highest priority sound
    if (priority > soundPriority) {
      soundToPlay = sound;
      soundPriority = priority;
    }

    // Find the matching target row and inject message (native DOM)
    if (targetUuid) {
      for (const targetRow of targetRows) {
        if (targetRow.getAttribute("data-target-uuid") === targetUuid) {
          // Check if we already added a message (for re-renders)
          const parent = targetRow.parentElement;
          if (parent && !parent.querySelector(`.effectiveness-message[data-target="${targetUuid}"]`)) {
            const messageDiv = document.createElement("div");
            messageDiv.className = `effectiveness-message ${messageClass}`;
            messageDiv.setAttribute("data-target", targetUuid);
            messageDiv.innerHTML = messageText;
            targetRow.insertAdjacentElement("afterend", messageDiv);
          }
          break;
        }
      }
    }
  }

  // Play sound effect (only once per message, highest priority)
  if (soundToPlay && game.settings.get(MODULE_ID, "playSounds")) {
    playEffectivenessSound(soundToPlay);
  }
});

async function playEffectivenessSound(soundPath) {
  const volume = game.settings.get(MODULE_ID, "soundVolume");

  try {
    // Check if file exists first
    const response = await fetch(soundPath, { method: "HEAD" });
    if (!response.ok) {
      console.debug(`${MODULE_ID} | Sound file not found: ${soundPath}`);
      return;
    }

    AudioHelper.play({
      src: soundPath,
      volume: volume,
      autoplay: true,
      loop: false
    }, false); // false = don't push to other clients
  } catch (e) {
    console.debug(`${MODULE_ID} | Could not play sound: ${soundPath}`, e);
  }
}
