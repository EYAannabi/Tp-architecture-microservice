async function register(){

const username=document.getElementById("username").value
const email=document.getElementById("email").value
const password=document.getElementById("password").value

const res=await fetch(API_URL+"/users/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,email,password})
})

const data=await res.json()

if(data.token){

localStorage.setItem("token",data.token)
localStorage.setItem("userId",data.user.id)

window.location="feed.html"

}else{
document.getElementById("msg").innerText=data.error
}

}

async function login(){

const email=document.getElementById("email").value
const password=document.getElementById("password").value

const res=await fetch(API_URL+"/users/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,password})
})

const data=await res.json()

if(data.token){

localStorage.setItem("token",data.token)
localStorage.setItem("userId",data.user.id)

window.location="feed.html"

}else{
document.getElementById("msg").innerText=data.error
}

}