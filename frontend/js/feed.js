async function loadPosts(){

const res = await fetch(API_URL+"/posts",{
headers:{
"Authorization":"Bearer "+localStorage.getItem("token")
}
})

const data = await res.json()

if(!data.posts){
console.log("Erreur API:",data)
return
}

const container=document.getElementById("posts")

container.innerHTML=""

data.posts.forEach(p=>{
container.innerHTML+=`

<div class="bg-white p-4 rounded shadow mt-4">

<p>${p.content}</p>

<div class="flex gap-4 mt-2">

<button onclick="likePost('${p._id}')">
❤️ ${p.likesCount}
</button>

</div>

<div class="mt-2">

<input id="c-${p._id}" placeholder="write comment..." class="border p-1">

<button onclick="addComment('${p._id}')">
comment
</button>

</div>

</div>

`

})

}

box.innerHTML+=`

<div class="border p-2 mt-2 rounded">

<p>${s.content}</p>

<button onclick="likeStory('${s._id}')">
🔥 ${s.likesCount}
</button>

</div>

`
async function createPost(){

const content=document.getElementById("postContent").value

const res=await fetch(API_URL+"/posts",{
method:"POST",
headers:authHeaders(),
body:JSON.stringify({content})
})

const data=await res.json()

console.log(data)

loadPosts()

}

async function likePost(id){

await fetch(API_URL+"/posts/"+id+"/like",{
method:"POST",
headers:{
"Authorization":"Bearer "+localStorage.getItem("token")
}
})

loadPosts()

}

async function deletePost(id){

await fetch(API_URL+"/posts/"+id,{
method:"DELETE",
headers:authHeaders()
})

loadPosts()

}

function logout(){

localStorage.clear()
window.location="index.html"

}

loadPosts()
async function addComment(postId){

const content = document.getElementById("c-"+postId).value

await fetch(API_URL+"/posts/"+postId+"/comment",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+localStorage.getItem("token")
},
body:JSON.stringify({content})
})

loadPosts()

}