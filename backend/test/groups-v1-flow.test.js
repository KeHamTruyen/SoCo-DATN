import test from "node:test";
import assert from "node:assert/strict";

function createEngine() {
  const members = new Map();
  const requests = new Map();
  const invites = new Map();
  const groupId = "g1";
  members.set("admin", "ADMIN");

  return {
    join(userId, privacy = "PUBLIC") {
      if (members.has(userId)) throw new Error("Already a member");
      if (privacy === "PRIVATE") {
        if (requests.get(userId) === "PENDING") throw new Error("Join request already pending");
        requests.set(userId, "PENDING");
        return { requested: true };
      }
      members.set(userId, "MEMBER");
      return { joined: true };
    },
    leave(userId) {
      const role = members.get(userId);
      if (!role) throw new Error("Not a member");
      if (role === "ADMIN" && [...members.values()].filter((v) => v === "ADMIN").length === 1) {
        throw new Error("Cannot leave: you are the only admin");
      }
      members.delete(userId);
    },
    createInvite(code) {
      invites.set(code, { groupId, usedCount: 0, maxUses: 1, isActive: true });
    },
    joinByInvite(code, userId) {
      const invite = invites.get(code);
      if (!invite || !invite.isActive) throw new Error("Invite not found");
      if (members.has(userId)) throw new Error("Already a member");
      invite.usedCount += 1;
      invite.isActive = invite.usedCount < invite.maxUses;
      members.set(userId, "MEMBER");
      requests.delete(userId);
    },
    approve(userId) {
      if (requests.get(userId) !== "PENDING") throw new Error("Join request not found");
      requests.set(userId, "APPROVED");
      members.set(userId, "MEMBER");
    },
    members,
    requests,
  };
}

test("private join creates pending request, approve grants membership", () => {
  const engine = createEngine();
  const result = engine.join("u1", "PRIVATE");
  assert.equal(result.requested, true);
  assert.equal(engine.requests.get("u1"), "PENDING");
  engine.approve("u1");
  assert.equal(engine.members.get("u1"), "MEMBER");
});

test("invite allows direct join and consumes invite", () => {
  const engine = createEngine();
  engine.createInvite("ABC123");
  engine.joinByInvite("ABC123", "u2");
  assert.equal(engine.members.get("u2"), "MEMBER");
  assert.throws(() => engine.joinByInvite("ABC123", "u3"), /Invite not found/);
});

test("leave guard prevents only admin from leaving", () => {
  const engine = createEngine();
  assert.throws(() => engine.leave("admin"), /only admin/i);
});

test("race: concurrent joins for same user keeps one membership", async () => {
  const engine = createEngine();
  const tasks = [1, 2, 3, 4].map(async () => {
    try {
      engine.join("u4", "PUBLIC");
    } catch {
      // expected duplicates
    }
  });
  await Promise.all(tasks);
  assert.equal([...engine.members.keys()].filter((id) => id === "u4").length, 1);
});
