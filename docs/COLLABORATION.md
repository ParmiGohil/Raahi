# Collaborating on Raahi

The shared public repository is [ParmiGohil/Raahi](https://github.com/ParmiGohil/Raahi). Use `main` as the common baseline. The connected account's write access was verified during setup; no additional invitation is needed for that account.

## Working model

Both teammates clone the same repository, open their clone in Codex, and use separate tasks and feature branches. Git shares files and commits; project documents carry the common context between conversations. Codex also supports worktrees for isolating tasks on one machine. [Official worktree documentation](https://learn.chatgpt.com/docs/environments/git-worktrees), [project context](https://learn.chatgpt.com/docs/projects)

The first implementation dependency is one scaffold and one shared data contract. Choose one integrator to create them. The other teammate can refine the UI flow and component boundaries while that baseline is prepared. Do not independently generate two complete applications.

## Suggested ownership

| Area | Owner |
|---|---|
| Initial scaffold, package manifest/lockfile, framework config | Integrator |
| Shared schemas and request/response contract | Engine owner, reviewed with UI owner |
| `src/engine/`, `fixtures/`, engine tests | Person A |
| `src/providers/`, `src/repositories/`, `src/app/api/` | Person A |
| `src/components/`, main pages, styles and UI interactions | Person B |
| Browser flow, presentation and recording | Person B |
| Shared status and merge coordination | Integrator |

Names are unassigned; these are proposed lanes. Directory names should follow the actual scaffold. Coordinate necessary changes across the boundary instead of silently rewriting another person's work.

## Branches and integration

1. Start from current `main` after fetching the latest changes.
2. Use a feature branch such as `codex/recovery-engine` or `codex/trip-workspace`.
3. Implement one bounded milestone and run its relevant checks.
4. Push that named branch to `origin`, open a pull request into `main`, and have the integrator review and merge it.
5. Fetch/integrate the updated baseline before continuing dependent work.

Suggested checkpoints: trip loads, impacts work, one recovery works, constraints/alternatives work, and persistence works. Integrate frequently; avoid leaving UI/backend integration until the final hour.

Each handoff should report:

```text
Branch / commit:
Working behavior:
Changed files and contracts:
How the other lane consumes the change:
Checks actually run:
Known failures:
Next milestone or dependency:
```

The UI may use a clearly marked shared response fixture while the engine is being built. The integrated demonstration must use computed engine results rather than hardcoded impact states, prices or plan counts.

## Keep history and context clear

The original source workspace retains an earlier private planning branch/remote as a backup. Raahi has a separate initial history containing only the public project baseline. Push named Raahi branches to `origin`; do not push all branches or merge the private archive history into this public repository.

The previous full conversation export and ZIP remain separate. Use the versioned project memory and status for ongoing coordination. The roadmap describes intended behavior; tests and the current code establish what is actually implemented.

Each teammate uses their own GitHub credentials and local environment values. The app is not yet scaffolded, so no shared build command or package environment exists. Document these once created.
