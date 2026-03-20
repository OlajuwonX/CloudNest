import { Feather } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui";
import type { FileCategory, FilterOptions, SortOption } from "@/types";

interface FilterSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentFilter: FileCategory | null;
  currentSort: SortOption;
  onApply: (options: FilterOptions) => void;
}

const FILE_TYPE_OPTIONS: { label: string; value: FileCategory | null }[] = [
  { label: "All", value: null },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Documents", value: "document" },
  { label: "Others", value: "other" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Largest first", value: "largest" },
  { label: "Name A–Z", value: "name" },
];

export default function FilterSheet({
  isVisible,
  onClose,
  currentFilter,
  currentSort,
  onApply,
}: FilterSheetProps) {
  const [draftCategory, setDraftCategory] = useState<FileCategory | null>(
    currentFilter,
  );
  const [draftSort, setDraftSort] = useState<SortOption>(currentSort);

  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["60%"], []);

  useEffect(() => {
    if (isVisible) {
      setDraftCategory(currentFilter);
      setDraftSort(currentSort);
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible, currentFilter, currentSort]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleApply = () => {
    onApply({ category: draftCategory, sortBy: draftSort });
    onClose();
  };

  const handleReset = () => {
    setDraftCategory(null);
    setDraftSort("newest");
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#FFFFFF" }}
      handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 40 }}
    >
      <BottomSheetView
        style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 32 }}
      >
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-lg font-semibold text-text">Filter & Sort</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
          File Type
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {FILE_TYPE_OPTIONS.map((opt) => {
            const isActive = draftCategory === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => setDraftCategory(opt.value)}
                className={`px-4 py-2 rounded-full border ${
                  isActive
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${isActive ? "text-white" : "text-text"}`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
          Sort By
        </Text>
        <View className="gap-1 mb-6">
          {SORT_OPTIONS.map((opt) => {
            const isActive = draftSort === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setDraftSort(opt.value)}
                className="flex-row items-center justify-between py-3 border-b border-border"
              >
                <Text className="text-base text-text">{opt.label}</Text>

                <View className="w-5 h-5 rounded-full border-2 border-primary items-center justify-center">
                  {isActive && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Apply"
          variant="primary"
          size="md"
          className="w-full mb-3"
          onPress={handleApply}
        />
        <TouchableOpacity onPress={handleReset} className="items-center py-2">
          <Text className="text-sm text-muted">Reset filters</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

// BottomSheetBackdrop renders the dimmed overlay behind the sheet.
// disappearsOnIndex={-1} means the backdrop fades out when the sheet fully closes.
// appearsOnIndex={0} means it appears as soon as the sheet starts to open.
// pressBehavior="close" lets the user dismiss by tapping the backdrop.

//  BottomSheet with index={-1} starts closed.
//  enablePanDownToClose lets the user drag it down to dismiss.
//  onClose fires when the sheet fully closes (including after a swipe down)
//  so the parent state stays in sync.
