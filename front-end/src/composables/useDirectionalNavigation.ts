import { onBeforeUnmount, onMounted, ref } from "vue";

type DirectionalNavigationOptions = {
  next: () => void;
  previous: () => void;
  isActive?: () => boolean;
};

// Minimum horizontal finger movement, in pixels, before a touch counts as a swipe.
const minSwipeDistance = 100;

// Arrow keys should not hijack normal typing inside inputs or editable text.
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function useDirectionalNavigation(options: DirectionalNavigationOptions) {
  // Store the first touch point so touchend can compare distance and direction.
  const touchStartX = ref(0);
  const touchStartY = ref(0);

  // Some screens only want navigation active while an overlay/card is open.
  function isActive() {
    return options.isActive?.() ?? true;
  }

  // Maps keyboard arrows to the same movement functions used by UI buttons.
  function handleArrowKeys(event: KeyboardEvent) {
    if (!isActive() || isTypingTarget(event.target)) return;

    if (event.key === "ArrowRight") {
      options.next();
    } else if (event.key === "ArrowLeft") {
      options.previous();
    }
  }

  // Captures where the swipe started.
  function handleTouchStart(event: TouchEvent) {
    if (!isActive()) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
  }

  // Converts a mostly horizontal swipe into next/previous navigation.
  function handleTouchEnd(event: TouchEvent) {
    if (!isActive()) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX.value;
    const deltaY = touch.clientY - touchStartY.value;

    if (
      Math.abs(deltaX) < minSwipeDistance ||
      Math.abs(deltaX) < Math.abs(deltaY)
    ) {
      return;
    }

    if (deltaX < 0) {
      options.next();
    } else {
      options.previous();
    }
  }

  // Keyboard navigation is global, so register it only while the owning view exists.
  onMounted(() => {
    window.addEventListener("keydown", handleArrowKeys);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleArrowKeys);
  });

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}
