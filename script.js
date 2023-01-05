// response elements
const responsePanel = document.querySelector('.response_div');
const responseImage = document.getElementById("response_image")
const responseName = document.getElementById("response_name")
const responseBlog = document.getElementById("response_blog")
const responseLocation = document.getElementById("response_location")
const responseFavoriteLanguage = document.getElementById("response_favoriteLanguage")
const responseBio = document.getElementById("response_bio")
// request elements
const inputUsername = document.getElementById("username")
const submitButton = document.getElementById("submit_button")
const userNotFoundError = document.getElementById("userNotFoundError_message")
const networkError = document.getElementById("networkError_message")
const localStorageMessage = document.getElementById("localStorage_message")


// once the user clicks on submit button, this function will run and find the data of user and display them
function getData(event) {
    event.preventDefault();

    // getType = 1 => read data from localStorage
    // getType = 2 => send request to server for getting data
    let getType = null 

    let userObj = null
    let username = inputUsername.value;
    if(window.localStorage.getItem(username) != null){
        // read data from localstorage
        getType = 1
        userObj = JSON.parse(window.localStorage.getItem(username))
        userNotFoundError.innerHTML = ""
        networkError.innerHTML = ""
        localStorageMessage.innerHTML = ""
        // display data
        setLeftPanel(getType, userObj);        
    }else{
        // send request to server for getting data and display
        getType = 2
        getDatafromServer(getType, username)
    }
}


// send request to server and get data for input username and display data in left panel
async function getDatafromServer(type, username) {
    // send request 
    let userObj = null  
    let response = await fetch(`https://api.github.com/users/${username}`);
    let obj = await response.json();
    // show useful messages and errors based on status code
    if (response.status == 200){
        userNotFoundError.innerHTML = ""
        networkError.innerHTML = ""
        localStorageMessage.innerHTML = ""
    }else{
        if(response.status == 404){
            userNotFoundError.innerHTML = "User Not Found!"
            networkError.innerHTML = ""
            localStorageMessage.innerHTML = ""
        }else{
            userNotFoundError.innerHTML = ""
            networkError.innerHTML = `Network Error (status: ${response.status})`
            localStorageMessage.innerHTML = ""
        }
    }
    
    if(obj.login != null){ // this user exists
        // send request to server for getting list of repos and finding the favorite language of user
        let response = await fetch(obj.repos_url);
        let responseContent = await response.text();
        let repos = await JSON.parse(responseContent)

        let repoObj = null
        const reposList = []
        for (let i = 0; i < repos.length; i++){
            let currentRepo = repos[i]
            repoObj = {
                language: currentRepo.language,
                pushedAt: new Date(currentRepo.pushed_at)
            }
            if(repoObj.language != null){
                reposList.push(repoObj)
            }
        }
        // sort repos based on pushad_at time
        reposList.sort((a, b) => b.pushedAt - a.pushedAt);
        console.log(reposList)

        let reposNumber = 5
        if(obj.public_repos < 5){
            reposNumber = obj.public_repos
        }

        // find the language of last five repos
        let languageObj = null
        const languagesList =  []
        for (let i = 0; i < reposNumber; i++){
            let repoObj = reposList[i]
            let language = repoObj.language
            
            if(languagesList.some(el => el.language === language)){
                let index = languagesList.findIndex((el => el.language === language))
                languagesList[index].cnt += 1
            }else{
                languageObj = {
                    language: language,
                    cnt: 1
                }
                languagesList.push(languageObj)
            }
        }
        // sort languages based on their cnt (the number of repetition in the last five repos)
        languagesList.sort((a, b) => b.cnt - a.cnt);
        console.log(languagesList)

        // find the favorite language
        let firstItem = languagesList[0]
        let favoriteLanguage = firstItem.language
        console.log(favoriteLanguage)

        // create userObj and save it to localStorage
        userObj = {
            name: obj.name,
            imageURL: obj.avatar_url,
            bio: obj.bio,
            blog: obj.blog,
            location: obj.location,
            favoriteLanguage: favoriteLanguage
        };
        window.localStorage.setItem(username, JSON.stringify(userObj));
    }

    // display data
    setLeftPanel(type, userObj);
}


// display user data in left panel (response_div)
function setLeftPanel(type, userObj) {
    let imageURL = userObj.imageURL
    let name = userObj.name
    let bio = userObj.bio
    let blog = userObj.blog
    let location = userObj.location
    let favoriteLanguage = userObj.favoriteLanguage

    // check response items:
    //      if they are null and empty    -> don't display
    //      if they aren't null and empty -> display 

    if(imageURL == ""){
        responseImage.style.display = "none"
    }else{
        responseImage.style.display = "block"
        responseImage.src = imageURL
    }

    if(name == null){
        responseName.style.display = "none";
    }else{
        responseName.style.display = "block";
        responseName.innerHTML = name
    }

    if(blog == ""){
        responseBlog.style.display = "none";
    }else{
        responseBlog.style.display = "block";
        responseBlog.innerHTML = `<a href="${blog}" target=_blank>${blog}</a>`
    }

    if(location == null){
        responseLocation.style.display = "none";
    }else{
        responseLocation.style.display = "block";
        responseLocation.innerHTML = location
    }

    if(favoriteLanguage == null){
        responseFavoriteLanguage.style.display = "none";
    }else{
        responseFavoriteLanguage.style.display = "block";
        responseFavoriteLanguage.innerHTML = `Favorite Language: ${favoriteLanguage}`
    }

    let bioContent = ""
    if(bio == null){
        responseBio.style.display = "none";
    }else{
        responseBio.style.display = "block";
        // handle \r\n in bio text
        bioContent = bio.replace(/\r\n/g, "<br />")
        responseBio.innerHTML = bioContent
    }
    
    // show localstorageMessage for times that we read data from local storage
    if(type == 1){
        localStorageMessage.innerHTML = "[From Local Storage]"
    }
    if(type == 2){
        localStorageMessage.innerHTML = ""
    }
    responsePanel.style.display = "flex"

}


// add event handler (getData function) to submit button
submitButton.addEventListener('click', getData);