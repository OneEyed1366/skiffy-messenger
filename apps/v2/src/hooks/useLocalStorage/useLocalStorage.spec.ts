// apps/v2/src/hooks/useLocalStorage/useLocalStorage.spec.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import {
  useLocalStorage,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getMultipleStorageItems,
  setMultipleStorageItems,
  removeMultipleStorageItems,
  clearStorage,
  getAllStorageKeys,
  createStorageKey,
  createUserStorageKey,
} from "./useLocalStorage";

jest.mock("@react-native-async-storage/async-storage");

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("useLocalStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //#region Hook Basic Functionality

  describe("basic functionality", () => {
    it("returns default value while loading", () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useLocalStorage("test-key", { defaultValue: "default" }),
      );

      expect(result.current.value).toBe("default");
      expect(result.current.isLoading).toBe(true);
    });

    it("loads stored value from AsyncStorage", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('"stored-value"');

      const { result } = renderHook(() => useLocalStorage<string>("test-key"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe("stored-value");
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("test-key");
    });

    it("returns null when no stored value and no default", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useLocalStorage<string>("test-key"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBeNull();
    });

    it("returns default value when no stored value exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useLocalStorage("test-key", { defaultValue: "default-value" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe("default-value");
    });
  });

  //#endregion Hook Basic Functionality

  //#region setValue

  describe("setValue", () => {
    it("stores value and updates state", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const { result } = renderHook(() => useLocalStorage<string>("test-key"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setValue("new-value");
      });

      // String values are stored raw (not JSON-encoded)
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        "new-value",
      );
      expect(result.current.value).toBe("new-value");
    });

    it("accepts updater function", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("5");
      mockAsyncStorage.setItem.mockResolvedValue();

      const { result } = renderHook(() => useLocalStorage<number>("counter"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setValue((prev) => (prev ?? 0) + 1);
      });

      expect(result.current.value).toBe(6);
    });

    it("sets error on storage failure", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockRejectedValue(new Error("Write failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useLocalStorage<string>("test-key"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.setValue("value")).rejects.toThrow(
          "Write failed",
        );
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Write failed");

      consoleSpy.mockRestore();
    });
  });

  //#endregion setValue

  //#region removeValue

  describe("removeValue", () => {
    it("removes value and resets to default", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('"stored"');
      mockAsyncStorage.removeItem.mockResolvedValue();

      const { result } = renderHook(() =>
        useLocalStorage("test-key", { defaultValue: "default" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe("stored");

      await act(async () => {
        await result.current.removeValue();
      });

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("test-key");
      expect(result.current.value).toBe("default");
    });

    it("removes value and sets null when no default", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('"stored"');
      mockAsyncStorage.removeItem.mockResolvedValue();

      const { result } = renderHook(() => useLocalStorage<string>("test-key"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.removeValue();
      });

      expect(result.current.value).toBeNull();
    });
  });

  //#endregion removeValue

  //#region refresh

  describe("refresh", () => {
    it("reloads value from storage", async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('"initial"')
        .mockResolvedValueOnce('"refreshed"');

      const { result } = renderHook(() => useLocalStorage<string>("test-key"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toBe("initial");

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.value).toBe("refreshed");
    });
  });

  //#endregion refresh

  //#region Custom Serialization

  describe("custom serialization", () => {
    it("uses custom serialize function", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const serialize = (value: { name: string }) => `custom:${value.name}`;
      const deserialize = (value: string) => ({ name: value.replace("custom:", "") });

      const { result } = renderHook(() =>
        useLocalStorage("test-key", { serialize, deserialize }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setValue({ name: "John" });
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        "custom:John",
      );
    });

    it("uses custom deserialize function", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("custom:Jane");

      const serialize = (value: { name: string }) => `custom:${value.name}`;
      const deserialize = (value: string) => ({ name: value.replace("custom:", "") });

      const { result } = renderHook(() =>
        useLocalStorage("test-key", { serialize, deserialize }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.value).toEqual({ name: "Jane" });
    });
  });

  //#endregion Custom Serialization

  //#region Error Handling

  describe("error handling", () => {
    it("sets error when loading fails", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Load failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() =>
        useLocalStorage("test-key", { defaultValue: "fallback" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Load failed");
      expect(result.current.value).toBe("fallback");

      consoleSpy.mockRestore();
    });
  });

  //#endregion Error Handling
});

//#region Utility Functions Tests

describe("getStorageItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns stored value", async () => {
    mockAsyncStorage.getItem.mockResolvedValue("value");

    const result = await getStorageItem("key");

    expect(result).toBe("value");
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("key");
  });

  it("returns null on error", async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error("Failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const result = await getStorageItem("key");

    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });
});

describe("setStorageItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores value", async () => {
    mockAsyncStorage.setItem.mockResolvedValue();

    await setStorageItem("key", "value");

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("key", "value");
  });

  it("throws on error", async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error("Write failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(setStorageItem("key", "value")).rejects.toThrow("Write failed");

    consoleSpy.mockRestore();
  });
});

describe("removeStorageItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("removes item", async () => {
    mockAsyncStorage.removeItem.mockResolvedValue();

    await removeStorageItem("key");

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("key");
  });
});

describe("getMultipleStorageItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns multiple values", async () => {
    mockAsyncStorage.multiGet.mockResolvedValue([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);

    const result = await getMultipleStorageItems(["key1", "key2"]);

    expect(result).toEqual({
      key1: "value1",
      key2: "value2",
    });
  });

  it("returns empty object on error", async () => {
    mockAsyncStorage.multiGet.mockRejectedValue(new Error("Failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const result = await getMultipleStorageItems(["key1"]);

    expect(result).toEqual({});
    consoleSpy.mockRestore();
  });
});

describe("setMultipleStorageItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores multiple values", async () => {
    mockAsyncStorage.multiSet.mockResolvedValue();

    await setMultipleStorageItems({ key1: "value1", key2: "value2" });

    expect(mockAsyncStorage.multiSet).toHaveBeenCalledWith([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);
  });
});

describe("removeMultipleStorageItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("removes multiple items", async () => {
    mockAsyncStorage.multiRemove.mockResolvedValue();

    await removeMultipleStorageItems(["key1", "key2"]);

    expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith(["key1", "key2"]);
  });
});

describe("clearStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("clears all storage", async () => {
    mockAsyncStorage.clear.mockResolvedValue();

    await clearStorage();

    expect(mockAsyncStorage.clear).toHaveBeenCalled();
  });
});

describe("getAllStorageKeys", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns all keys", async () => {
    mockAsyncStorage.getAllKeys.mockResolvedValue(["key1", "key2", "key3"]);

    const keys = await getAllStorageKeys();

    expect(keys).toEqual(["key1", "key2", "key3"]);
  });

  it("returns empty array on error", async () => {
    mockAsyncStorage.getAllKeys.mockRejectedValue(new Error("Failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const keys = await getAllStorageKeys();

    expect(keys).toEqual([]);
    consoleSpy.mockRestore();
  });
});

//#endregion Utility Functions Tests

//#region Key Helper Tests

describe("createStorageKey", () => {
  it("creates namespaced key", () => {
    const key = createStorageKey("settings", "theme");

    expect(key).toBe("settings:theme");
  });
});

describe("createUserStorageKey", () => {
  it("creates user-scoped key", () => {
    const key = createUserStorageKey("user123", "preferences");

    expect(key).toBe("user:user123:preferences");
  });
});

//#endregion Key Helper Tests
