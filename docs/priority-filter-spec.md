# Priority Filter Specification

## Goal

Help managers quickly focus on equipment requests by filtering the existing list by priority. High-priority requests need the most attention.

## User Need

As a manager, I want to select a request priority and see only matching requests, so I can focus on requests that need attention and easily return to the full list.

## Functional Rules

1. Provide a single-select dropdown with the options All, Low, Normal, and High. Only one option can be selected at a time.
2. Default to All on initial load and after every reload. Do not persist the selected filter.
3. All displays every existing request, including requests with missing or unrecognized priorities.
4. Low, Normal, and High each display only requests with that existing priority value. Requests with missing or unrecognized priorities do not match these options.
5. Use priority alone to determine matches. Needed-by dates do not affect filtering.
6. Keep matching requests in their current order, including ties. Filtering must not sort requests.
7. Show the correct number of requests matching the selected option. Under All, count every request.
8. If no requests match the selected priority, show exactly: "No requests found for this priority." The matching count is zero.
9. Switching back to All restores the complete list in its current order.
10. Filtering changes only the displayed view. It must not delete, rewrite, or otherwise change any request or its stored priority.
11. Adding a new request while a priority filter is selected saves the request normally and keeps the selected filter active. If the new request matches, it appears in the filtered list and the matching count increases. If it does not match, it remains saved but hidden and the matching count stays unchanged. Selecting All or the new request's matching priority displays it. Under All, every newly saved request is displayed and counted. Preserve the application's existing order for new requests.
12. The request form provides a Priority dropdown with Low, Normal, and High. Normal is selected by default and after a successful submission. Save the selected priority with each new request; do not assign priorities to existing records.

## Constraints

- Use the existing priority information and browser storage without requiring a login or database.
- Preserve every existing request and all its data, including records with missing or unrecognized priorities.
- Keep the application in plain HTML, CSS, and JavaScript without adding frameworks, build tools, external services, or production dependencies.
- Provide a visible label for the dropdown and keep it keyboard accessible with a visible focus indicator.

## Acceptance Criteria

1. **Default view:** Given stored requests with Low, Normal, High, missing, and unrecognized priorities, when the application loads, All is selected, every request is displayed in its existing order, and the count equals the total number of requests.
2. **Single-priority selection:** Given requests with multiple priorities, when the manager selects Low, Normal, or High, only requests with that priority are displayed, the count equals the number displayed, and the dropdown has only one selected option. Verify each priority separately.
3. **Priority takes precedence over dates:** Given a High request with a later needed-by date and a Low request with an earlier date, when High is selected, only the High request is displayed. Changing needed-by dates does not change which priority a request matches.
4. **Stable order:** Given multiple matching requests interspersed with other priorities, when a priority is selected, the matching requests retain their relative order, including requests tied on priority or needed-by date.
5. **Missing or unrecognized priorities:** Given requests with missing or unrecognized priorities, when Low, Normal, or High is selected, those requests are excluded. When All is selected, they are displayed and counted without changing their data.
6. **No matches:** Given no requests matching a selected priority, when that priority is selected, no request rows are displayed, the count is zero, and the message is exactly "No requests found for this priority."
7. **Return to the full list:** Given an active priority filter, when All is selected, every request reappears in its existing order and the count equals the full list size.
8. **Reload and data preservation:** Given existing stored requests, when the manager switches among filter options and reloads the application, All is selected, every request reappears, and the stored requests and all their field values remain unchanged.
9. **No login or database:** Given the application running with its existing browser storage, a manager can use the filter without authenticating or connecting to a database.
10. **Keyboard use:** A manager can identify the dropdown by its visible label, focus it using the keyboard, and select each option with a visible focus indicator.
11. **Add a matching request:** Given High is selected, when a manager successfully adds a High-priority request, it is saved normally, High remains selected, the request appears in the existing new-request order, and the matching count increases by one.
12. **Add a nonmatching request:** Given High is selected, when a manager successfully adds a Low-priority request, it is saved normally, High remains selected, the request is hidden, and the matching count stays unchanged. Selecting All or Low displays the saved request and includes it in the matching count.
13. **Add under All:** Given All is selected, when a manager successfully adds a request, it is saved normally, All remains selected, the request appears in the existing new-request order, and the count increases by one.
14. **Priority capture:** The request form defaults to Normal. Each of Low, Normal, and High can be selected and saved with a new request. After a successful submission, the form priority resets to Normal independently of the active list filter. Existing records retain their original data.

The feature is complete when these acceptance criteria are verified, relevant automated tests pass, and the filtering behavior is checked in the browser.

## Out of Scope

- Selecting multiple priorities at the same time.
- Filtering by needed-by dates or other request fields.
- Sorting, ranking, or reordering requests.
- Persisting the selected filter across reloads.
- Editing priorities on existing requests or redefining the Low, Normal, and High values.
- Assigning default priorities to, migrating, or repairing existing records.
- Adding authentication, a database, or external services.
- Unrelated interface redesigns or request-management features.
