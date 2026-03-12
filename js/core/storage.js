function saveToken(token) {
    sessionStorage.setItem("token", token);
}

function getToken() {
    return sessionStorage.getItem("token");
}

function removeToken() {
    sessionStorage.removeItem("token");
}