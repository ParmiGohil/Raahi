# Run Raahi locally

The complete prototype is on `main` in https://github.com/ParmiGohil/Raahi. Use **Node.js 24** and Git. No API keys, database account, Vercel account or `.env` file are needed for the normal local demo.

## First-time setup

Install Node.js 24 using your preferred installer. If you already use nvm on macOS/Linux, run `nvm install 24` and `nvm use 24`. Check `node --version`: it should start with `v24.`.

```sh
git clone https://github.com/ParmiGohil/Raahi.git
cd Raahi
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:3000**. Keep the terminal running. Press Ctrl+C to stop the server.

For editing, use `npm run dev` instead of the build/start commands. Do not run development and production servers simultaneously in the same checkout.

## If you already cloned the repository

Stop the running server first. Check for local work before changing branches:

```sh
git status
```

If there are changes, commit them on your own branch or preserve them before proceeding. Do not discard files or force-reset the checkout just to update the demo. Once the checkout is clean:

```sh
git fetch origin
git switch main
git pull --ff-only origin main
npm ci
npm run build
npm start
```

If `git pull --ff-only` refuses because your local main has diverged, keep those commits and ask for help reconciling them. A fresh clone into a different folder is also safe.

## Demo walkthrough

1. Click **Reset demo** for a clean start.
2. Click **Try copilot**, choose **Keep my concert**, then **Run demo request**.
3. Watch the simulated workflow and the actual engine-checked ₹2,300 preview.
4. Click **Use these preferences**. This activates the delay scenario and sets the protected concert / ₹2,500 limit.
5. Click **Review this plan**, inspect the cash and prepaid-loss breakdown, then **Apply simulated recovery**.
6. Refresh: the revised itinerary should remain.
7. Reset and try **Challenge the budget** to demonstrate an honest no-feasible-option outcome.

The manual scenario controls also demonstrate flight delay, concert cancellation and combined disruption. All schedules, inventory and supplier policies are fixtures. AI interpretation and supplier actions are explicitly simulated; timing, costs, dependencies and feasibility are calculated by code.

## Working alongside a teammate

Start each new change from updated `main`, on your own branch:

```sh
git switch main
git pull --ff-only origin main
git switch -c codex/your-feature
```

Agree who owns which files, commit a coherent milestone, then push that named branch and open a pull request. Avoid editing the same components simultaneously. Read `docs/COLLABORATION.md` before parallel implementation.

To hand the project to Codex, open the cloned `Raahi` folder and paste:

> Read AGENTS.md, CURRENT_STATUS.md, SESSION_MEMORY.md and docs/BUILD_HANDOFF.md. Inspect Git status before edits. Main contains the working prototype, UI redesign and simulated copilot. Preserve its deterministic recovery engine and explicit fixture/simulation labels. Do not restart research or rewrite the app. Work on a named codex/ branch and run checks at milestone boundaries. My assigned task is: [describe the task].

## Common issues

- **Wrong Node version:** switch to Node 24, then run `npm ci` again.
- **npm 11.0 install failure:** under Node 24, try `npx npm@11.11.0 ci`.
- **Port 3000 already used:** stop the older server. Alternatively run `npm run dev -- --port 3001` and open port 3001.
- **Old production UI:** stop the server, run `npm run build`, then `npm start`.
- **Expired review after restarting:** refresh and review the plan again before applying.
- **Unexpected demo state:** use Reset demo. Local state lives in ignored `.raahi/` files and is isolated by browser cookie.

Useful milestone checks: `npm test`, `npm run typecheck`, `npm run build`. Latest implementation gate passed 13 tests and the production build; the mobile copilot → review → apply → refresh flow was also verified.

## Connected prototype walkthrough

On the connected-experience branch, home offers **Try demo scenario** and **Add my itinerary**. My itinerary opens its own page. Use Dependencies to inspect timings/buffers, What-if to preview without saving, and Recovery to set a disruption and review/apply a plan. All pages read the same saved trip.

Add my itinerary saves each booking immediately. Upload PDFs to preview their original pages and extract actual text locally. Review individual entries or confirm all extracted schedule items before saving. The sample button remains explicitly fictional. Scanned/image-only PDFs require manual entry; no document is uploaded to a cloud service. Personal trips use entered details, not the fictional Goa replacement catalog. The existing simulated copilot remains available for the Goa demo.

Latest extension gate: 17 tests and production build passed under Node 24, with browser checks of copilot, health, manual/PDF sample entry and persistence. If port 3000 serves an older checkout, use `npm start -- --port 3001` after building and open `http://127.0.0.1:3001`.

## Remaining delivery work

- Publish and verify a Vercel URL after account sign-in and deployment-secret configuration (see `docs/HOSTING.md`). Local setup does not depend on that.
- Create the final PPT and rehearse the presentation.
- Capture a backup demo recording and confirm organizer submission requirements.
