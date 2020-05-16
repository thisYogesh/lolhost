function fetchData(url, options = {}){
    fetch(url, {
        method: 'post'
    }).then(function(resp){
        return resp.json().then(function(json){
            options.responce && options.responce(json)
        })
    }).catch(function(error){
        console.log('Error in fetchData')
        options.error && options.error(error)
    })
}

window.fetchData = fetchData