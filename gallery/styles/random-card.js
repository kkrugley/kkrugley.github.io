function getRandomRotation() {
    return Math.floor(Math.random() * 91) - 45; // random rotation between -45 and 45 degrees
}

// cards list
var items = [
    { imageUrl: "img/clip-comp.jpg", linkUrl: "clip-comp", linkTitle: "Daily: clothespin composition" },
{ imageUrl: "img/cloth-study.jpg", linkUrl: "cloth-study", linkTitle: "Daily: cloth study project" },
{ imageUrl: "img/coffee-stool.jpg", linkUrl: "coffee-stool", linkTitle: "Coffee Stool Design" },
{ imageUrl: "img/fed-mikron.jpg", linkUrl: "fed-mikron", linkTitle: "FED Mikron-II Visualisation" },
{ imageUrl: "img/forest-house.jpg", linkUrl: "forest-house", linkTitle: "Daily: forest house" },
{ imageUrl: "img/gamine-render.jpg", linkUrl: "gamine-render", linkTitle: "Renders for Gamine NYC" },
{ imageUrl: "img/grinder-diploma.jpg", linkUrl: "grinder-diploma", linkTitle: "Diploma Project" },
{ imageUrl: "img/kiinde-redesign.jpg", linkUrl: "kiinde-redesign", linkTitle: "Renders for Kiinde's rebrending" },
{ imageUrl: "img/point-room.jpg", linkUrl: "point-room", linkTitle: "Daily: meshpoint room - photogrammetry project" },
{ imageUrl: "img/totem.jpg", linkUrl: "totem", linkTitle: "Uni: totem design" },
{ imageUrl: "img/zywy-las.jpg", linkUrl: "zywy-las", linkTitle: "Contemporary art: Żywy las" },
    // additional
];

document.addEventListener("DOMContentLoaded", function(event) {
    var numBlocks = 8; // number of cards

    for (var i = 0; i < numBlocks; i++) {
        var itemIndex = Math.floor(Math.random() * items.length); // random index from banch
        var item = items[itemIndex]; 

        var newDiv = document.createElement("div");
        newDiv.className = "container";
        newDiv.style.left = Math.floor(Math.random() * (window.innerWidth - 250)) + "px";
        newDiv.style.top = Math.floor(Math.random() * (window.innerHeight - 250)) + "px";
        newDiv.style.transform = "rotate(" + getRandomRotation() + "deg)";

        var link = document.createElement("a");
        link.href = item.linkUrl;

        var img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = "Image " + (i + 1);

        link.appendChild(img);

        var textLink = document.createElement("a");
        textLink.href = item.linkUrl;
        textLink.textContent = item.linkTitle;

        newDiv.appendChild(link);
        newDiv.appendChild(document.createElement("br"));
        newDiv.appendChild(textLink);


        document.body.appendChild(newDiv);

        
        items.splice(itemIndex, 1);
    }

     
     var currentYear = new Date().getFullYear();
     
     document.getElementById("currentYear").textContent = currentYear;

});
