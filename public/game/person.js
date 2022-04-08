let onlinePeopleParent = document.getElementById("onlinePeople");

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

socket.on('takeOnlineInfo', data => {
  removeOldDataFromOnlineInfo();
      data.forEach((person) => {
        addPersonToList(person);
      });
})

function getOnlineInfo() {
  onlinePeopleParent.style.display = "flex";
  
  socket.emit('getOnlineInfo', {});
  // fetch("/getOnlineInfo", {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // })
  //   .then((data) => data.json())
  //   .then((data) => {
  //     removeOldDataFromOnlineInfo();
  //     data.forEach((person) => {
  //       addPersonToList(person);
  //     });
  //   });
}

function closeOnlineInfo() {
  onlinePeopleParent.style.display = "none";
}
