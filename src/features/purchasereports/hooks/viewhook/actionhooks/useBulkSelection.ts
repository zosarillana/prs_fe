import { useState } from "react";

export function useBulkSelection(selectableIndexes: number[]) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const toggleItem = (idx: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, idx] : prev.filter((i) => i !== idx)
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedItems(checked ? selectableIndexes : []);
  };

  const allSelected =
    selectableIndexes.length > 0 &&
    selectedItems.length === selectableIndexes.length;

  const isIndeterminate =
    selectedItems.length > 0 &&
    selectedItems.length < selectableIndexes.length;

  return {
    selectedItems,
    setSelectedItems,
    toggleItem,
    toggleAll,
    allSelected,
    isIndeterminate,
  };
}
