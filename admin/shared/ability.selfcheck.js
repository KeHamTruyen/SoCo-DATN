/**

 * ponytail: assert-based check for ability profiles (no test framework).

 * Run: node ability.selfcheck.js (cwd admin/shared).

 */

import {

    createAdminAbility,

    listAbilityLabels,

    resolveAdminProfile,

} from "./ability.js";



function assert(cond, msg) {

    if (!cond) throw new Error(msg);

}



const demo = createAdminAbility("demo");

assert(demo.can("read", "Dashboard"), "demo reads dashboard");

assert(demo.can("resolve", "Report"), "demo resolves reports");

assert(demo.can("review", "SellerApplication"), "demo reviews sellers");

assert(!demo.can("update", "User"), "demo cannot update users");

assert(!demo.can("delete", "Post"), "demo cannot delete posts");

assert(!demo.can("manage", "Category"), "demo cannot manage categories");



const mod = createAdminAbility("moderator");

assert(mod.can("delete", "Post"), "moderator deletes posts");

assert(!mod.can("manage", "Category"), "moderator no categories");



const ops = createAdminAbility("ops");

assert(ops.can("manage", "Category"), "ops manages categories");

assert(!ops.can("resolve", "Report"), "ops no reports");



const superA = createAdminAbility("super");

assert(superA.can("manage", "all"), "super manages all");



assert(resolveAdminProfile({ profile: "demo" }) === "demo", "resolve demo");

assert(resolveAdminProfile(null) === "super", "legacy null → super");



assert(listAbilityLabels("super")[0] === "manage all", "super labels");

assert(listAbilityLabels("demo").includes("resolve Report"), "demo labels");

assert(!listAbilityLabels("demo").includes("update User"), "demo no update");



console.log("ability.selfcheck: ok");


