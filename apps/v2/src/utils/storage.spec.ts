// apps/v2/src/utils/storage.spec.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as v from "valibot";

import {
  getItem,
  setItem,
  removeItem,
  getMultipleItems,
  setMultipleItems,
  clearStorage,
  getAllKeys,
  isSecureStoreAvailable,
  getSecureItem,
  setSecureItem,
  removeSecureItem,
  getJsonItem,
  getValidatedJsonItem,
  setJsonItem,
  STORAGE_PREFIX,
  SECURE_STORAGE_PREFIX,
} from "./storage";

jest.mock("@react-native-async-storage/async-storage");
jest.mock("expo-secure-store");

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe("storage utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //#region General Storage

  describe("getItem", () => {
    it("returns stored value", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("test-value");

      const result = await getItem("test-key");

      expect(result).toBe("test-value");
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        `${STORAGE_PREFIX}test-key`,
      );
    });

    it("returns null for missing key", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getItem("missing-key");

      expect(result).toBeNull();
    });

    it("returns null on error", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Read failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getItem("error-key");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("setItem", () => {
    it("stores value with prefix", async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await setItem("test-key", "test-value");

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `${STORAGE_PREFIX}test-key`,
        "test-value",
      );
    });

    it("throws on error", async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error("Write failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(setItem("test-key", "value")).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("removeItem", () => {
    it("removes item with prefix", async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await removeItem("test-key");

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        `${STORAGE_PREFIX}test-key`,
      );
    });
  });

  describe("getMultipleItems", () => {
    it("returns multiple values", async () => {
      mockAsyncStorage.multiGet.mockResolvedValue([
        [`${STORAGE_PREFIX}key1`, "value1"],
        [`${STORAGE_PREFIX}key2`, "value2"],
      ]);

      const result = await getMultipleItems(["key1", "key2"]);

      expect(result).toEqual({
        key1: "value1",
        key2: "value2",
      });
    });

    it("returns empty object on error", async () => {
      mockAsyncStorage.multiGet.mockRejectedValue(new Error("Failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getMultipleItems(["key1"]);

      expect(result).toEqual({});
      consoleSpy.mockRestore();
    });
  });

  describe("setMultipleItems", () => {
    it("stores multiple values", async () => {
      mockAsyncStorage.multiSet.mockResolvedValue();

      await setMultipleItems({ key1: "value1", key2: "value2" });

      expect(mockAsyncStorage.multiSet).toHaveBeenCalledWith([
        [`${STORAGE_PREFIX}key1`, "value1"],
        [`${STORAGE_PREFIX}key2`, "value2"],
      ]);
    });
  });

  describe("clearStorage", () => {
    it("removes only app-prefixed keys", async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        `${STORAGE_PREFIX}key1`,
        `${STORAGE_PREFIX}key2`,
        "other-app:key",
      ]);
      mockAsyncStorage.multiRemove.mockResolvedValue();

      await clearStorage();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        `${STORAGE_PREFIX}key1`,
        `${STORAGE_PREFIX}key2`,
      ]);
    });

    it("does nothing when no app keys exist", async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue(["other-app:key"]);

      await clearStorage();

      expect(mockAsyncStorage.multiRemove).not.toHaveBeenCalled();
    });
  });

  describe("getAllKeys", () => {
    it("returns app keys without prefix", async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        `${STORAGE_PREFIX}key1`,
        `${STORAGE_PREFIX}key2`,
        "other-app:key",
      ]);

      const keys = await getAllKeys();

      expect(keys).toEqual(["key1", "key2"]);
    });
  });

  //#endregion

  //#region Secure Storage

  describe("isSecureStoreAvailable", () => {
    it("returns true when available", async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);

      const result = await isSecureStoreAvailable();

      expect(result).toBe(true);
    });

    it("returns false when not available", async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(false);

      const result = await isSecureStoreAvailable();

      expect(result).toBe(false);
    });
  });

  describe("getSecureItem", () => {
    it("returns stored value", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("secret-value");

      const result = await getSecureItem("token");

      expect(result).toBe("secret-value");
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
        `${SECURE_STORAGE_PREFIX}token`,
        undefined,
      );
    });

    it("returns null on error", async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(
        new Error("Access denied"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getSecureItem("token");

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("setSecureItem", () => {
    it("stores value securely", async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();

      await setSecureItem("token", "secret-value");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        `${SECURE_STORAGE_PREFIX}token`,
        "secret-value",
        undefined,
      );
    });

    it("throws on error", async () => {
      mockSecureStore.setItemAsync.mockRejectedValue(new Error("Write failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(setSecureItem("token", "value")).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("removeSecureItem", () => {
    it("removes secure item", async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      await removeSecureItem("token");

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        `${SECURE_STORAGE_PREFIX}token`,
        undefined,
      );
    });
  });

  //#endregion

  //#region JSON Helpers

  describe("getJsonItem", () => {
    it("parses JSON value and returns unknown", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"key":"value"}');

      const result = await getJsonItem("json-key");

      expect(result).toEqual({ key: "value" });
    });

    it("returns null for missing key", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getJsonItem("missing");

      expect(result).toBeNull();
    });

    it("returns null for invalid JSON", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("invalid-json");
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getJsonItem("bad-json");

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("getValidatedJsonItem", () => {
    const TestSchema = v.object({
      name: v.string(),
      age: v.number(),
    });

    it("parses and validates JSON value", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"name":"John","age":30}');

      const result = await getValidatedJsonItem("user", TestSchema);

      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("returns null for missing key", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getValidatedJsonItem("missing", TestSchema);

      expect(result).toBeNull();
    });

    it("returns null for invalid JSON", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("not-json");
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getValidatedJsonItem("bad-json", TestSchema);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it("returns null when schema validation fails", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"name":"John"}'); // missing age
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getValidatedJsonItem("invalid-data", TestSchema);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it("returns null when type mismatch", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        '{"name":"John","age":"thirty"}',
      ); // age is string
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getValidatedJsonItem("wrong-type", TestSchema);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("setJsonItem", () => {
    it("stringifies and stores value", async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await setJsonItem("json-key", { key: "value" });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `${STORAGE_PREFIX}json-key`,
        '{"key":"value"}',
      );
    });
  });

  //#endregion
});
