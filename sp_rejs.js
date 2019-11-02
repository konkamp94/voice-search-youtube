$( document ).ready(function() {
    console.log( "ready!" );
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	const recognition = new SpeechRecognition();
	recognition.interimResults = true;
	recognition.lang = 'el-GR';
	gapi.load("client", () => loadClient()); // cb 
	// new Promise((resolve,reject)=>{
	// 	gapi.load("client");
	// 	console.log(gapi.client);
	// 	resolve()
	// 	console.log("loaded");
	// })
	// .then((res)=>{
		// console.log(gapi.client);
	// 	console.log("loaded");
	// })
	// .catch((err)=>{
	// 	console.log(err);
	// })


	// recognition.addEventListener("result",(e)=>{
	// 	let results = Array.from(e.results);
	// 	for(let i=0;i<results.length;i++){
	// 		if(results[i].isFinal){
	// 			console.log(results[i][0].transcript);
	// 			execute(results[i][0].transcript);

	// 		}
	// 		else{
	// 			console.log("interim");
	// 		}
	// 	}
	// });
	// recognition.addEventListener('end',recognition.start);
	// recognition.start();
	// console.log(gapi.client);
});




function loadClient() {
	console.log(gapi.client);
    gapi.client.setApiKey("AIzaSyCXzpc_8NeYWR88-61CayeDESRukb2_9zQ");
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err); });
}
  // Make sure the client is loaded before calling this method.
function execute(voice_search) {
	return gapi.client.youtube.search.list({
	  "part": "snippet",
	  "q": voice_search
	})
	.then(function(response) {
		// Handle the results here (response.result has the parsed body).
		console.log("Response", response);
	},
    function(err) { 
    	console.error("Execute error", err); 
    });
}


class Kabou {
	constructor() {
		this.currentVideo = null;
		if(!gapi) throw Error("Need google here");
		gapi.load("client", () => this.initAPI()); // cb 
	}

	onRecognition(fn) {
		this._onRecognition = fn;
		return this;
	}

	initAPI() {
	    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognition = new SpeechRecognition();
		recognition.interimResults = true;
		recognition.lang = 'el-GR';
		recognition.addEventListener("result",(e)=>{
			let results = Array.from(e.results);
			for(let i=0;i<results.length;i++){
				if(results[i].isFinal){
					this.result = results[i][0].transcript;
					this._onRecognition && this._onRecognition(this.result);
				}
			}
		});
		this.__recognition = recognition;

    	gapi.client.setApiKey("AIzaSyCXzpc_8NeYWR88-61CayeDESRukb2_9zQ");
    	return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err); });

	}

	recognition() {
		// recognition.addEventListener('end',recognition.start);
		this.__recognition.start();
	}

	findVideo() {
		return gapi.client.youtube.search.list({
		  "part": "snippet",
		  "q": this.result
		})
		.then((response) => {
			// Handle the results here (response.result has the parsed body).
			console.log("Response", response);
			let id = response.result.items[0].id.videoId;
			this.videoURL = "https://www.youtube.com/embed/"+id+"?&autoplay=1&mute=0";
		},
	    function(err) { 
	    	console.error("Execute error", err); 
	    });
	}

}
let test = new Kabou();
test.onRecognition((res) => {
	console.log("Result found!", res);
	test.findVideo().then(() => {
		document.getElementById('panel').style.background = "white";
		document.getElementById('myframe').src = test.videoURL;
		document.getElementById('title').innerHTML = res;
	});
});

document.getElementById('panel').addEventListener('click', () => {
	document.getElementById('panel').style.background = "#ff4e45";
	test.recognition();
})