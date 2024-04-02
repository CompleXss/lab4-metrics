document.getElementById('enterBtn').onclick = () => enter()



function enter() {
    const login = document.getElementById('login').value
    const password = document.getElementById('password').value

    console.log('trying to login')

    fetch('/login', {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            login: login,
            password: password
        })
    })
    .then(resp => {
        if (resp.redirected) {
            console.log(resp.url)
            window.location.href = resp.url
        }
    })
}
