let currentChatId: string | null = null;

export function setCurrentChatId(id: string | null) {
  currentChatId = id;
}

export function getCurrentChatId() {
  return currentChatId;
}

