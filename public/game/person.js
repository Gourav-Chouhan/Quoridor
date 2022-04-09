let onlinePeopleParent = document.getElementById("onlinePeople");
let incomingRequestParent = document.getElementById("incomingRequests");

function addPersonToList(person) {
	let people = document.createElement("div");
	people.className = "people";
	let dp = document.createElement("div");
	dp.className = "dp";
	let peopleName = document.createElement("div");
	peopleName.className = "people-name";
	let addFriend = document.createElement("div");
	addFriend.className = "add-friend";
	let challengeFriend = document.createElement("div");
	challengeFriend.className = "challenge-friend";
	let peopleStatus = document.createElement("div");
	peopleStatus.className = "people-status";
	let nameDiv = document.createElement("div");
	nameDiv.className = "name-div";
	let frndIcon = document.createElement("span");
	frndIcon.className = "material-icons";
	frndIcon.innerHTML = "&#xe7fe;";
	let challengeIcon = document.createElement("span");
	challengeIcon.className = "material-icons";
	challengeIcon.innerHTML = "&#xea32;";
	let dpIcon = document.createElement("img");
	dpIcon.crossOrigin = "Anonymous";
	// dpIcon.className = "material-icons";
	people.setAttribute("data-socketId", person.socketId);
	people.setAttribute("data-status", person.status);
	if (!playing && person.status === "idle") {
		challengeIcon.addEventListener("click", sendMatchRequest);
	} else {
		challengeIcon.style.filter = "opacity(0.3)";
	}
	dpIcon.src = person.imageUrl;
	peopleName.textContent = person.name;
	peopleStatus.textContent = person.status;
	addFriend.appendChild(frndIcon);
	challengeFriend.appendChild(challengeIcon);
	dp.appendChild(dpIcon);
	nameDiv.appendChild(peopleName);
	nameDiv.appendChild(peopleStatus);
	people.appendChild(dp);
	people.appendChild(nameDiv);
	people.appendChild(addFriend);
	people.appendChild(challengeFriend);
	console.log(person);

	onlinePeopleParent.appendChild(people);
}

// let obj = {
//   name: "Gouravvv",
//   status: "online",
// };

// for (let i = 0; i < 10; i++) {
//   addPersonToList(obj);
// }

function removeOldDataFromOnlineInfo() {
	while (onlinePeopleParent.childElementCount > 1) {
		onlinePeopleParent.removeChild(onlinePeopleParent.lastChild);
	}
}

socket.on("takeOnlineInfo", (data) => {
	removeOldDataFromOnlineInfo();
	data.forEach((person) => {
		if (person.socketId != socketId) {
			addPersonToList(person);
		}
	});
});

function getOnlineInfo() {
	incomingRequestParent.style.display = "none";
	onlinePeopleParent.style.display = "flex";
	socket.emit("getOnlineInfo", {});
}

function closeOnlineInfo() {
	onlinePeopleParent.style.display = "none";
}

//working over this

function getRequestInfo() {
	document.getElementById("showRequest").style.animation = "null";
	onlinePeopleParent.style.display = "none";
	incomingRequestParent.style.display = "flex";
	console.log(incomingRequestParent);
}

function closeIncomingRequests() {
	incomingRequestParent.style.display = "none";
}

function addIncomingToList(person) {
	// console.log(person);
	let people = document.createElement("div");
	people.className = "people";
	let dp = document.createElement("div");
	dp.className = "dp";
	let peopleName = document.createElement("div");
	peopleName.className = "people-name";
	let addFriend = document.createElement("div");
	addFriend.className = "add-friend";
	let challengeFriend = document.createElement("div");
	challengeFriend.className = "challenge-friend";
	let nameDiv = document.createElement("div");
	nameDiv.className = "name-div";
	let frndIcon = document.createElement("span");
	frndIcon.className = "material-icons";
	frndIcon.innerHTML = "&#xe5c9;";
	let challengeIcon = document.createElement("span");
	challengeIcon.className = "material-icons";
	challengeIcon.innerHTML = "&#xe86c;";
	let dpIcon = document.createElement("img");
	dpIcon.crossOrigin = "Anonymous";
	// dpIcon.className = "material-icons";
	dpIcon.src = person.imageUrl;
	peopleName.textContent = person.name;
	addFriend.appendChild(frndIcon);
	challengeFriend.appendChild(challengeIcon);
	dp.appendChild(dpIcon);
	nameDiv.appendChild(peopleName);
	people.appendChild(dp);
	people.appendChild(nameDiv);
	addFriend.style.backgroundColor = "red";
	addFriend.style.color = "white";
	people.appendChild(addFriend);
	challengeFriend.style.backgroundColor = "green";
	challengeFriend.style.color = "white";

	addFriend.addEventListener("click", cancelMatchRequest);
	challengeIcon.addEventListener("click", acceptMatchRequest);
	people.setAttribute("data-socketid", person.from);
	people.appendChild(challengeFriend);
	console.log(person);
	incomingRequestParent.appendChild(people);
}

// addIncomingToList({ name: "Gourav Chouhan" });

function cancelMatchRequest(e) {
	e.target.parentElement.parentElement.remove();
}

function sendMatchRequest(e) {
	console.log(e.target.parentElement.parentElement.dataset);
	socket.emit("sendMatchRequest", {
		to: e.target.parentElement.parentElement.dataset.socketid,
	});
}

socket.on("receiveMatchRequest", (data) => {
	console.log(data);
	for (let i = 1; i < incomingRequestParent.childElementCount; i++) {
		if (incomingRequestParent.children[i].dataset.socketid == data.from) {
			return;
		}
	}
	document.getElementById("showRequest").style.animation =
		"gotRequestAnimation 1s infinite ease-in";
	addIncomingToList(data);
});

function acceptMatchRequest(e) {
	console.log(e.target.parentElement.parentElement.dataset);
	socket.emit("makeMatch", {
		player1: socketId,
		player2: e.target.parentElement.parentElement.dataset.socketid,
	});
}

function closePopAllPopUps() {
	onlinePeopleParent.style.display = "none";
	incomingRequestParent.style.display = "none";
	document.getElementById("showRequest").style.display = "none";
}
