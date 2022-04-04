function onSignIn(googleUser) {
  userProfile.id_token = googleUser.getAuthResponse().id_token;

  userProfile.name = googleUser.getBasicProfile().getName();
  userProfile.email = googleUser.getBasicProfile().getEmail();
  userProfile.imageUrl = googleUser.getBasicProfile().getImageUrl();
  urs = googleUser;
  var profile = googleUser.getBasicProfile();
  fetch("/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userProfile),
  });
  // window.location.replace("index.html");
  document.getElementById("login-page").style.display = "none";
  document.getElementById("usrName").textContent = googleUser.Du.VX;

  // alert("login successfull");
}
