import CsvWriter from "csv-writer";
import {fetchData} from "../modules/communication.mjs";
import {relationshipClassType} from "../modules/entityClasses.mjs";

/**
 * Creates props for figures.
 * @returns {object} Figure props.
 */
function makeProps() {
    return {
        identifier: {type: [String, Number], required: true},
        dataTable: {type: Array, required: true},
        indexNames: {type: Array, required: true},
        entityClass: {type: Object, required: true},
        parameterName: {type: String, required: true},
    };
}

/**
 * Returns dimensions of an entity class.
 * @param {object} entityClass Object or Relationship class info.
 * @returns {string[]} Object class names.
 */
function headerNames(entityClass) {
    let objectClassNames = entityClass.objectClassNames;
    if(objectClassNames === undefined) {
        objectClassNames = [entityClass.name];
    }
    return objectClassNames;
}

/**
 * Compiles a CSV file from figures data and initiates download.
 * @param {Array[]} dataTable Figure's data.
 * @param {object} entityClass Entity class information.
 * @param {string} parameterName Parameter's name.
 * @param {string[]} indexNames Data index names.
 */
function downloadAsCsv(dataTable, entityClass, parameterName, indexNames) {
    const classNames = headerNames(entityClass);
    const stringifier = CsvWriter.createArrayCsvStringifier({header: [...classNames, ...indexNames, "y"]});
    const header = stringifier.getHeaderString()
    const content = stringifier.stringifyRecords(dataTable);
    const aElement = document.createElement("a");
    aElement.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(header + content)
    );
    aElement.setAttribute("download", `${entityClass.name}_${parameterName}.csv`);
    aElement.style.display = "none";
    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
}

export {
    downloadAsCsv,
    headerNames,
    makeProps,
}
