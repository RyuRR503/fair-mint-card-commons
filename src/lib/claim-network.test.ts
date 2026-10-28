import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

test("two earlier claims on shared Wi-Fi must not create a network claim quota", () => {
  // Structural regression guard: catches a network-count query reintroduced
  // anywhere in claim issuance, independent of error wording or UI copy.
  const source = readFileSync(new URL("./game.functions.ts", import.meta.url), "utf8");
  const file = ts.createSourceFile("game.functions.ts", source, ts.ScriptTarget.Latest, true);
  const networkFilters: ts.CallExpression[] = [];
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && node.expression.name.text === "eq"
      && node.arguments[0] && ts.isStringLiteral(node.arguments[0])
      && node.arguments[0].text === "ip") {
      networkFilters.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  assert.equal(networkFilters.length, 0, "Shared network must not be queried to enforce a daily quota");
});