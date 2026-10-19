import assert from "node:assert/strict";
import test from "node:test";

import {
  RequestValidationError,
  STORAGE_KEY,
  appendRequest,
  createRequest,
  filterRequestsByPriority,
  loadRequests,
  saveRequests,
} from "../src/request-store.js";

const validInput = {
  requester: "  Jordan Lee  ",
  department: "Operations",
  equipment: "  Laptop  ",
  neededBy: "2026-09-15",
  reason: "  Replace a failed field computer.  ",
};

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("createRequest trims input and adds system fields", () => {
  const request = createRequest(validInput, {
    id: "request-1",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  assert.deepEqual(request, {
    id: "request-1",
    requester: "Jordan Lee",
    department: "Operations",
    equipment: "Laptop",
    neededBy: "2026-09-15",
    reason: "Replace a failed field computer.",
    priority: "Normal",
    createdAt: "2026-08-17T12:00:00.000Z",
  });
});

test("createRequest reports missing required fields", () => {
  assert.throws(
    () => createRequest({ ...validInput, requester: "", equipment: " " }),
    (error) => {
      assert.ok(error instanceof RequestValidationError);
      assert.deepEqual(Object.keys(error.errors), ["requester", "equipment"]);
      return true;
    },
  );
});

test("appendRequest returns a new list with the newest request first", () => {
  const original = [{ id: "old" }];
  const result = appendRequest(original, { id: "new" });

  assert.deepEqual(result.map((request) => request.id), ["new", "old"]);
  assert.deepEqual(original.map((request) => request.id), ["old"]);
});

test("saveRequests and loadRequests round-trip valid records", () => {
  const storage = new MemoryStorage();
  const request = createRequest(validInput, {
    id: "request-2",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  saveRequests([request], storage);

  assert.deepEqual(loadRequests(storage), [request]);
});

test("loadRequests safely handles damaged stored data", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, "not-json");

  assert.deepEqual(loadRequests(storage), []);
});

test("priority filtering preserves records and order, including missing and unknown priorities", () => {
  const records = ["High", "Low", undefined, "High", "Urgent", "Normal"].map((priority, index) => {
    const record = { ...createRequest(validInput, { id: String(index) }), extraField: "preserve me" };
    if (priority === undefined) delete record.priority;
    else record.priority = priority;
    return record;
  });
  const storage = new MemoryStorage();
  saveRequests(records, storage);
  const before = storage.getItem(STORAGE_KEY);
  const loaded = loadRequests(storage);

  for (const priority of ["Low", "Normal", "High"]) {
    const result = filterRequestsByPriority(loaded, priority);
    assert.deepEqual(result.map(({ id }) => id), records.filter((r) => r.priority === priority).map(({ id }) => id));
  }
  assert.deepEqual(filterRequestsByPriority(loaded), records);
  assert.deepEqual(filterRequestsByPriority(loaded, "All"), records);
  assert.equal(storage.getItem(STORAGE_KEY), before);
  assert.deepEqual(loadRequests(storage), records);
});

test("priority matching ignores dates and returns an empty list for no matches", () => {
  const records = [
    { id: "low", priority: "Low", neededBy: "2026-01-01" },
    { id: "high", priority: "High", neededBy: "2027-01-01" },
  ];
  assert.deepEqual(filterRequestsByPriority(records, "High").map((r) => r.id), ["high"]);
  records[0].neededBy = "2028-01-01";
  records[1].neededBy = "2025-01-01";
  assert.deepEqual(filterRequestsByPriority(records, "High").map((r) => r.id), ["high"]);
  assert.deepEqual(filterRequestsByPriority(records, "Normal"), []);
});

test("new requests save each supported priority and default to Normal", () => {
  const storage = new MemoryStorage();
  for (const priority of ["Low", "Normal", "High"]) {
    const request = createRequest({ ...validInput, priority });
    saveRequests([request], storage);
    assert.equal(loadRequests(storage)[0].priority, priority);
  }
  assert.equal(createRequest(validInput).priority, "Normal");
});

test("new requests reject invalid priorities without changing legacy record loading", () => {
  for (const priority of ["", "Urgent", "high"]) {
    assert.throws(() => createRequest({ ...validInput, priority }), (error) => {
      assert.ok(error instanceof RequestValidationError);
      assert.deepEqual(Object.keys(error.errors), ["priority"]);
      return true;
    });
  }
});
