TaskForge

A beginner-friendly task manager built with plain HTML, CSS and JavaScript (no libraries). Tasks are saved in the browser, so they are still there after a refresh.

How to run

Put the three files in one folder and open task-forge.html in a browser.

What works so far

1. Add a task: the Add Task button opens a form modal (title, description, category, priority, due date). The page does not refresh on submit, and the form clears afterwards.
2. Show tasks: each task is drawn as a card by cloning the HTML <template>.
3. Edit a task: the Edit button loads the task into the form, and saving updates it instead of adding a new one.
4. Delete a task: the Delete button removes the task using splice.
5. Complete or pending: the Complete button flips completed between true and false. Completed tasks look faded with a struck-through title.
6. Statistics: Total, Completed, Pending and Overdue counts update every time the list is redrawn.
7. Task details: clicking a card opens a modal with its full information.
8. Dark theme: the theme button switches data-theme on <html> and remembers the choice.
9. Saving: tasks are stored in localStorage under the key Task.
10. Keyboard shortcuts: N opens the new task form, Esc closes a modal, and Ctrl+Enter submits the form.