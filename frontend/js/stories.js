async function loadStories(){

const res = await fetch(API_URL+"/stories",{
headers:{
"Authorization":"Bearer "+localStorage.getItem("token")
}
})

const data = await res.json()

if(!data.stories){
console.log("Erreur stories:",data)
return
}

const box=document.getElementById("stories")

box.innerHTML=""

data.stories.forEach(s=>{

box.innerHTML+=`

<div class="border p-2 mt-2 rounded">

<p>${s.content}</p>

</div>

`

})

}

async function createStory(){

const content=document.getElementById("storyContent").value

const res=await fetch(API_URL+"/stories",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+localStorage.getItem("token")
},
body:JSON.stringify({content})
})

const data=await res.json()

console.log(data)

loadStories()

}
async function likeStory(id){

await fetch(API_URL+"/stories/"+id+"/like",{
method:"POST",
headers:{
"Authorization":"Bearer "+localStorage.getItem("token")
}
})

loadStories()

}

loadStories()