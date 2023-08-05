const links = $("a");
links.forEach(link => {
    link.on("click", event => {
        event.preventDefault();
    })
    console.log('Vehicle selected: ' + link.)
});