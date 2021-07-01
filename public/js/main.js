
const btnLogIn = document.getElementById('logIn'),
    btnLogOut = document.getElementById('logOut'),
    webContent = document.getElementById('webContent'),
    form = document.getElementById('form'),
    inputText = document.getElementById('inputText')

let userName = document.getElementById('userName')

firebase.auth().onAuthStateChanged((user) => {
    //logged user
    if (user) {
        userAuth(user)
        chatContent(user)
        hideButton("logIn")
    }
    //user not logged
    else {
        userWithoutAuth()
        hideButton("logOut")
    }
})



const userWithoutAuth = () => {
    console.log('usuario sin registrar')
    form.classList.add('d-none')
    webContent.innerHTML = `
        <p id="startSesion" class="lead text-center my-5">Debes iniciar sesión</p>
    `
    const provider = new firebase.auth.GoogleAuthProvider()
    btnLogIn.onclick = () => {
        firebase.auth().signInWithPopup(provider).then((result) => {
            const user = result.user
            userName.innerHTML = user.displayName
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code
            // The email of the user's account used.
            const email = error.email
        })
    }

}

const userAuth = user => {
    console.log('usuario registrado')
    const startSesion = document.getElementById('startSesion')
    form.classList.remove('d-none')
    if (startSesion) webContent.removeChild(startSesion)
    userName.innerHTML = user.displayName

    btnLogOut.onclick = () => {
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            userName.innerHTML = "BChat"
        }).catch((error) => {
            // An error happened.
            console.log(error)
        })
    }
}

const chatContent = user => {
    //Does not load the first entry
    firebase.firestore().collection("chat").add({
        text: inputText.value,
        uid: user.uid,
        date: Date.now()
    })
    //load entrys in firebase
    form.addEventListener('submit', e => {
        e.preventDefault()
        let message = inputText.value
        form.reset()
        console.log(message)
        //empty text
        if (!message.trim()) {
            console.log("sin texto")
            return
        }
        firebase.firestore().collection("chat").add({
            text: message,
            uid: user.uid,
            userName: user.displayName,
            date: Date.now()
        })
        .then(() => {
            console.log("Document successfully written!")
            console.log(user)
            
        })
        .catch((error) => {
            console.error("Error writing document: ", error)
            inputText.value = message
        })
    })
    //bring firebase entries
    firebase.firestore().collection("chat").orderBy('date').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                console.log("Agregar chat: ", change.doc.data())

                if (user.uid === change.doc.data().uid) {
                    if (change.doc.data().text !== "") {
                        webContent.innerHTML += `
                            <div class="text-end">
                                <div class="badge p-2 px-3 border border-1 border-dark text-dark prim-chat">
                                    <span class="d-block text-start lead fs-6 mb-1">Tú</span>
                                    <hr class="my-1">
                                    <p class = "mt-2 mb-1 text-wrap">${change.doc.data().text}</p>
                                </div>
                            </div>
                        `
                    }
                    console.log(user)
                    
                }
                else {
                    if (change.doc.data().text !== "") {
                        webContent.innerHTML += `
                            <div class="text-start">
                                <div class="badge p-2 px-3 border border-1 border-dark text-dark sec-chat">
                                    <span class="d-block text-start lead fs-6 mb-1">${change.doc.data().userName}</span>
                                    <hr class="my-1">
                                    <p class = "mt-2 mb-1 text-start text-wrap">${change.doc.data().text}</p>
                                </div>
                            </div>
                            
                        `
                    }
                    
                }
                webContent.scrollTop = webContent.scrollHeight
            } 
        })
    })
}

const hideButton = status => {
    const elementToHide = document.getElementById(status)
    let elementToShow = ""
    //get the opposite element to the one entered
    if (status === "logIn") elementToShow = "logOut"
    else elementToShow = "logIn"
    elementToShow = document.getElementById(elementToShow)
    elementToHide.style.display = "none"
    elementToShow.style.display = "inline-block"
}
