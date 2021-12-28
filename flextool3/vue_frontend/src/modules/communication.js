function getScriptData() {
    const dataElement = document.querySelector("#script-data");
    return JSON.parse(dataElement.textContent);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function makeFetchInit() {
    return {
        method: "POST",
        credentials: "same-origin",
        headers: {"X-CSRFToken": csrftoken, 'Content-Type': 'application/json'}
    };
}

function fetchModelData(queryType, projectId, modelUrl, extraBody = {}) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({"type": queryType, "projectId": projectId, ...extraBody});
    return fetch(modelUrl, fetchInit).then(function(response) {
        if (!response.ok) {
          throw new Error("Network response was not OK.");
        }
        return response.json();
    });
}

export {getScriptData, makeFetchInit, fetchModelData};
