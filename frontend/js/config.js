const API_URL = "http://localhost:3000/api"

function getToken(){
    return localStorage.getItem("token")
}

function authHeaders(){
    return {
        "Content-Type":"application/json",
        "Authorization":"Bearer " + getToken()
    }
}