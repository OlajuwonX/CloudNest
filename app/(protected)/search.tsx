import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FileCard from "@/components/FileCard";
import { EmptyState, LoadingSkeleton } from "@/components/ui";
import { fileKeys, getAllFiles } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";
import type { FileItem } from "@/types";

const RECENT_SEARCHES_KEY = "@cloudnest/recent_searches";
const MAX_RECENT = 8;

export default function SearchScreen() {
  const user = useAuthStore((s) => s.user);
  const inputRef = useRef<TextInput>(null);

  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((val) => {
      if (val) setRecentSearches(JSON.parse(val));
    });
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // debounce the search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const { data: allFiles = [], isLoading } = useQuery({
    queryKey: fileKeys.search(user?.$id ?? ""),
    queryFn: () => getAllFiles(user!.$id),
    enabled: !!user,
  });

  // filter files by filename substring match
  const results = useMemo<FileItem[]>(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return allFiles.filter((f) => f.fileName.toLowerCase().includes(q));
  }, [allFiles, debouncedQuery]);

  const saveRecentSearch = useCallback(
    async (term: string) => {
      const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
        0,
        MAX_RECENT,
      );
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    },
    [recentSearches],
  );

  const removeRecentSearch = useCallback(
    async (term: string) => {
      const updated = recentSearches.filter((s) => s !== term);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    },
    [recentSearches],
  );

  const clearAllRecent = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const handleRecentPress = (term: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRawQuery(term);
    setDebouncedQuery(term);
  };

  const handleSubmitEditing = () => {
    if (rawQuery.trim()) saveRecentSearch(rawQuery.trim());
  };

  const handleFilePress = (file: FileItem) => {
    if (rawQuery.trim()) saveRecentSearch(rawQuery.trim());
    router.push(`/(protected)/file/${file.$id}` as any);
  };

  const showRecent = !rawQuery && recentSearches.length > 0;
  const showEmpty = !!debouncedQuery && !isLoading && results.length === 0;
  const showResults = !!debouncedQuery && results.length > 0;
  const showIdle = !rawQuery && recentSearches.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center bg-background rounded-xl px-3 py-2 gap-2 border border-border">
          <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            ref={inputRef}
            value={rawQuery}
            onChangeText={setRawQuery}
            onSubmitEditing={handleSubmitEditing}
            placeholder="Search files..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            className="flex-1 text-sm text-text"
            style={{ paddingVertical: 0 }}
          />
          {rawQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setRawQuery("")}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather name="x-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <LoadingSkeleton variant="list-item" count={5} />
      ) : showIdle ? (
        <View className="flex-1 items-center justify-center gap-4">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center">
            <Feather name="search" size={32} color="#9CA3AF" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-base font-semibold text-text">
              Search your files
            </Text>
            <Text className="text-sm text-muted">
              Type a file name to find it instantly
            </Text>
          </View>
        </View>
      ) : showRecent ? (
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-5 pt-5 pb-2">
            <Text className="text-sm font-semibold text-text">
              Recent Searches
            </Text>
            <TouchableOpacity onPress={clearAllRecent} activeOpacity={0.7}>
              <Text className="text-xs text-danger font-medium">Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 96 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleRecentPress(item)}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 px-5 py-3.5 border-b border-border bg-surface"
              >
                <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center shrink-0">
                  <Feather name="clock" size={15} color="#6B7280" />
                </View>
                <Text className="flex-1 text-sm text-text" numberOfLines={1}>
                  {item}
                </Text>
                <TouchableOpacity
                  onPress={() => removeRecentSearch(item)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Feather name="x" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : showEmpty ? (
        <EmptyState
          icon="search"
          title="No files found"
          subtitle={`No files match '${debouncedQuery}'`}
        />
      ) : showResults ? (
        <View className="flex-1">
          <Text className="text-xs text-muted px-5 pt-4 pb-1">
            {`${results.length} result${results.length !== 1 ? "s" : ""} for "${debouncedQuery}"`}
          </Text>
          <FlatList
            data={results}
            keyExtractor={(f) => f.$id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 96,
              borderRadius: 12,
              overflow: "hidden",
            }}
            renderItem={({ item }) => (
              <FileCard
                file={item}
                viewMode="list"
                onPress={() => handleFilePress(item)}
              />
            )}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
