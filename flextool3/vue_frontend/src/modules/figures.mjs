import DataFrame from "data-forge";
import {nameFromKey} from "./plotEditors.mjs";

/** Compiles a CSV file from figure data and initiates download.
 * @param {DataFrame} dataFrame Data to write to the CSV.
*/
function downloadAsCsv(dataFrame) {
    const aElement = document.createElement("a");
    aElement.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(renameColumns(dataFrame).toCSV()),
    );
    aElement.setAttribute("download", "data.csv");
    aElement.style.display = "none";
    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
}

function renameColumns(dataFrame) {
    const names = dataFrame.getColumnNames();
    const renamed = names.map(nameFromKey);
    const renameInstructions = {};
    for(const [i, name] of names.entries()) {
        const newName = renamed[i];
        if(name !== newName) {
            renameInstructions[name] = newName;
        }
    }
    return dataFrame.renameSeries(renameInstructions);
}

export {
    downloadAsCsv,
}
