import type { KeyboardEvent } from "react";

type UseSelectKeyDownOptions = {
  isOpen: boolean;
  itemsCount: number;
  activeIndex: number;
  onOpen: () => void;
  onClose: (focusTrigger?: boolean) => void;
  onActiveIndexChange: (index: number) => void;
  onCommit: (index: number) => void;
};

/**
 * Клавиатурный обработчик для кастомного select:
 */
export function useSelectKeyDown({
  isOpen,
  itemsCount,
  activeIndex,
  onOpen,
  onClose,
  onActiveIndexChange,
  onCommit,
}: UseSelectKeyDownOptions) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (itemsCount === 0) return;

    const key = event.key;

    if (!isOpen) {
      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "Enter" ||
        key === " "
      ) {
        event.preventDefault();
        onOpen();
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        onActiveIndexChange((activeIndex + 1) % itemsCount);
        break;
      case "ArrowUp":
        event.preventDefault();
        onActiveIndexChange(
          activeIndex <= 0 ? itemsCount - 1 : activeIndex - 1,
        );
        break;
      case "Home":
        event.preventDefault();
        onActiveIndexChange(0);
        break;
      case "End":
        event.preventDefault();
        onActiveIndexChange(itemsCount - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (activeIndex >= 0) onCommit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        onClose(true);
        break;
      case "Tab":
        onClose(false);
        break;
      default:
        break;
    }
  };
}