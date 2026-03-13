async function loadProfile(){

const id = localStorage.getItem("userId")

const res = await fetch(API_URL+"/users/"+id,{
headers:{
"Authorization":"Bearer "+localStorage.getItem("token")
}
})

const data = await res.json()

console.log(data)

if(!data.user){
console.log("Erreur profile:",data)
return
}

document.getElementById("username").innerText = data.user.username
document.getElementById("postsCount").innerText = data.user.posts.length

}

loadProfile()