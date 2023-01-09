/**
 * Registers a listener to react to page unloading when there are pending changes.
 * @param {Boolean} hasUncommitted True, if there are pending changes, False otherwise.
 */
function uncommittedChangesWatcher(hasUncommitted) {
    if (hasUncommitted) {
        addEventListener("beforeunload", promptUnload, { capture: true });
    }
    else {
        removeEventListener("beforeunload", promptUnload, { capture: true });
    }
}

/**
 * Forces a prompt on 'beforeunload' event when there is uncommitted data.
 * @return {string} Prompt text (usually ignored by browser).
 */
function promptUnload(event) {
    event.preventDefault();
    return event.returnValue = "There are uncommitted changes."
}

export {
    uncommittedChangesWatcher,
};
