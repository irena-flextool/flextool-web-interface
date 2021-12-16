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
    return {method: "POST", credentials: "same-origin", headers: {"X-CSRFToken": csrftoken, 'Content-Type': 'application/json'}};
}
export {getScriptData, makeFetchInit};
