// Run in the loaded demo with: agent-browser eval --stdin < tests/browser-flow.js
// This checks the integrated browser → API → disk → rendered UI path.
(async () => {
  const report = [];
  const wait = async (check, label) => {
    await new Promise((resolve) => setTimeout(resolve, 100)); // allow React to commit the pending state
    const end = Date.now() + 8000;
    while (Date.now() < end) {
      if (check()) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(
      `Timed out: ${label}. ${document.querySelector("[role=alert]")?.textContent ?? ""}`,
    );
  };
  const button = (text) =>
    [...document.querySelectorAll("button")].find(
      (el) => el.textContent.trim() === text,
    );
  const click = (text) => {
    const el = button(text);
    if (!el || el.disabled) throw new Error(`Unavailable button: ${text}`);
    el.click();
  };
  const settled = () => !document.querySelector(".saving");
  const assert = (value, label) => {
    if (!value) throw new Error(label);
    report.push(label);
  };
  click("Reset demo");
  await wait(
    () => settled() && document.querySelector(".ready-panel"),
    "reset",
  );
  click("Flight delayed 3 hours");
  await wait(
    () => settled() && document.querySelectorAll(".plan-card").length === 3,
    "three plans",
  );
  assert(
    [...document.querySelectorAll(".price")]
      .map((el) => el.textContent)
      .join("|")
      .includes("₹800") && document.body.innerText.includes("₹2,300"),
    "Delay produces computed recovery cards",
  );
  document.querySelector(".protect-control input").click();
  await wait(
    () => settled() && document.querySelectorAll(".plan-card").length === 1,
    "protect original event",
  );
  assert(
    document.querySelector(".plan-card h3").textContent === "Keep the moment",
    "Protection keeps only the original-session plan",
  );
  async function budget(value) {
    const input = document.querySelector("#budget");
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 100));
    input.form.requestSubmit();
    await wait(settled, "budget update");
  }
  await budget("2000");
  await wait(
    () => !!document.querySelector(".no-solution"),
    "no feasible plan",
  );
  assert(
    document.querySelectorAll(".plan-card").length === 0,
    "Insufficient cash produces no solution",
  );
  await budget("3000");
  await wait(
    () => document.querySelectorAll(".plan-card").length === 1,
    "restore cash",
  );
  click("Review this plan");
  await wait(() => document.querySelector("dialog")?.open, "review modal");
  assert(
    document.querySelector(".ledger").textContent.includes("₹2,300") &&
      document.querySelector(".ledger").textContent.includes("₹400"),
    "Review distinguishes cash from prepaid loss",
  );
  click("Apply simulated recovery");
  await wait(
    () => settled() && document.querySelector(".success-panel"),
    "applied recovery",
  );
  const persisted = await (await fetch("/api/trip")).json();
  assert(
    persisted.state.applied.id === "original" &&
      persisted.state.history.length === 1,
    "Applied itinerary and action history are persisted through API",
  );
  assert(
    !document.querySelector("dialog").open,
    "Review closes after application",
  );
  return {
    passed: report,
    revision: persisted.state.revision,
    cashNow: persisted.state.applied.ledger.cashNow,
  };
})();
