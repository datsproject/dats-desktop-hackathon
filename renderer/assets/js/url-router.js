const path = require('path');

const routes = {
    dashboard: {
        template: "/pages/dashboard.html", //path.join(__dirname, "/pages/dashboard.html"),
        title: "",
        description: ""
    },
    ddos: {
        template: "/pages/dos.html", //path.join(__dirname, "/pages/dos.html"),
        title: "",
        description: ""
    },
    super: {
        template: path.join(__dirname, "/pages/super.html"),
        title: "",
        description: ""
    },
    cyber: {
        template: "../../pages/cyber.html",
        title: "",
        description: ""
    },
    "/vulnerability": {
        template: "../../pages/vulnerability.html",
        title: "",
        description: ""
    },
    "/blockchain": {
        template: "../../pages/blockchain.html",
        title: "",
        description: ""
    },
}

const locationHandler = async() => {
    let location = window.location.hash.replace("#", "");

    if (location.length == 0) {
        location = "dashboard";
    }

    switchContent(location);

    //document.body.removeChild(document.getElementById("routerScript"));

    // const route = routes[location] || routes["404"];
    // const html = await fetch(route.template).then((response) => response.text());
    // document.getElementById("content").innerHTML = html;

    // document.title = route.title;
    //document.querySelector('meta[name="description"]').setAttribute("content", route.description);
};


const switchContent = (location)=>{
    document.querySelector("#dashboard").classList.add('d-none');
    document.querySelector("#ddos").classList.add('d-none');
    document.querySelector("#super").classList.add('d-none');

    document.querySelector(`#${location}`).classList.remove('d-none');

}

// create a function that watches the hash and calls the urlLocationHandler
window.addEventListener("hashchange", locationHandler);

locationHandler();