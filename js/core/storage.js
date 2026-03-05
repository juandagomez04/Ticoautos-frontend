const KEY = "token";

export function saveToken(token) {
    sessionStorage.setItem(KEY, token);
}

export function getToken() {
    return sessionStorage.getItem(KEY);
}

export function clearToken() {
    sessionStorage.removeItem(KEY);
}