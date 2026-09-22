# Requirement specification

Revision: 3 (confirmed)

## Application target

Anonymous Personal To-do List 1.0

## Goal

Let anyone open a personal to-do list immediately, with no registration or login, and manage only their own tasks.

## In scope

- A first visit identifies the visitor automatically, so each visitor sees only their own tasks.
- Add a new task.
- View the task list.
- Mark a task complete, and restore a completed task to incomplete.
- Delete a task.

## Confirmed business decision

- How a visitor is identified: automatic anonymous identifier only. A visitor is identified on first visit with no typing, and this version has no email field. The business reply on 2026-09-22 selected Option A, the recommended option.

## Acceptance criteria

- AC-1: A first-time visitor can add, view, complete or restore, and delete tasks without registering, logging in, or paying.
- AC-2: A visitor sees only their own tasks; another visitor does not see them.
- AC-3: Marking a task complete shows it as complete and the state survives a page reload; restoring returns it to incomplete.
- AC-4: Deleting a task removes it from the list and it stays removed after a page reload.

## Business examples

- EX-1: Visitor A adds "Buy milk". Visitor B opens the app and does not see "Buy milk".
- EX-2: Visitor A marks "Buy milk" complete, reloads the page, and still sees it complete.
- EX-3: Visitor A deletes "Buy milk"; after a reload it is gone.

## This change does not

- Account system or authentication (no passwords and no verified identities).
- Collaboration or sharing.
- Due dates, reminders, priority levels, tags, attachments, search.
