var ipAddress = null;

console.log("Initializing...")

fetch("https://api.ipify.org/")
.then(result => {
	return result.text();
})
.then(result => {
	ipAddress = result;
	console.log(ipAddress);
})

function searchVideos() {
	if (ipAddress == null) {
		alert("You are not connected to the internet yet.")
		return;
	}
	let searchInput = document.getElementById("lookup").value;
	if (searchInput.trim().length == 0) {
		alert("Please input something first.")
	}
	let inputJson = {
	    context:{
            client: {
				clientName: "MWEB",
				clientVersion: "2.20250108.06.00",
				originalUrl: "https://m.youtube.com",
				playerType: "UNIPLAYER",
				acceptHeader: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            	remoteHost: ipAddress
            },
            user:{
                lockedSafetyMode:false,
            },
            request:{
                useSsl: true,
                internalExperimentFlags: [],
                consistencyTokenJars: []
            }
        },
        query: searchInput
	  };

	console.log(inputJson);

	fetch("https://cors-anywhere.herokuapp.com/https://m.youtube.com/youtubei/v1/search?prettyPrint=true", {
	  method: "POST",
	  body: JSON.stringify(inputJson),
	  headers: {
	    "Content-type": "application/json; charset=UTF-8"
	  }
	}).then(result => {
		return result.json();
	}).then(result => {
		let results = document.getElementById("results");
		while (results.firstChild) {
			results.removeChild(results.lastChild);
		}
		let contents2 = result["contents"]["sectionListRenderer"]["contents"]
		if (contents2 === undefined) {
			return;
		}
		for (let j = 0; j < contents2.length; ++j) {
			let contentsRaw = contents2[j];
			if (contentsRaw === undefined) {
				continue;
			}
			let contentsItems = contentsRaw["itemSectionRenderer"];
			if (contentsItems === undefined) {
				continue;
			}
			if (contentsItems["contents"] === undefined) {
				continue;
			}
			let contents = contentsItems["contents"];
			for (let i = 0; i < contents.length; ++i) {
				const rawContent = contents[i];
				if (rawContent["videoWithContextRenderer"] !== undefined) {
					let child = document.createElement("div");
					child.style.textAlign = "center";
					let content = rawContent["videoWithContextRenderer"];
					let title = content["headline"]["runs"][0]["text"];
					let watch_id = content["videoId"];
					let length = null;
					if (content["lengthText"] !== undefined) {
						let lengthJson = content["lengthText"];
						if (lengthJson["runs"] !== undefined) {
							length = lengthJson["runs"][0]["text"];
						}
					}
					let published_time = null;
					if (content["publishedTimeText"] !== undefined) {
						published_time = content["publishedTimeText"]["runs"][0]["text"];
					}
					let thumb_url = "https://i.ytimg.com/vi/" + watch_id + "/hqdefault.jpg";
					let paragraph = document.createElement("p");
					paragraph.innerHTML = title;
					if (length !== null) {
						paragraph.innerHTML += " | " + length;
					}
					if (published_time !== null) {
						paragraph.innerHTML += "<br>" + published_time;
					}
					let img = document.createElement("img");
					img.setAttribute("src", thumb_url);
					img.setAttribute("alt", "");
					child.append(document.createElement("br"));
					child.append(img);
					child.append(paragraph);
					let link = document.createElement("a");
					link.setAttribute("href", "https://youtu.be/" + watch_id);
					link.innerHTML = "<p>View video</p>";
					child.append(link);
					child.append(document.createElement("br"));
					if (i != 0) {
						results.append(document.createElement("hr"));
					}
					results.append(child);
				}
			}
		}
	}).catch(error => {
		alert("Error fetching videos.")
    	console.error('Error fetching videos:', error);
    });;
}

let lookup = document.getElementById("lookup");
lookup.addEventListener('keydown', (event) => {
	if (event.key === "Enter") {
		searchVideos();
	}
});