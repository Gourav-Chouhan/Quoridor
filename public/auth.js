
function onSignIn(googleUser) {
  console.log(googleUser);
  userProfile.id_token = googleUser.getAuthResponse().id_token;

  userProfile.name = googleUser.getBasicProfile().getName();
  userProfile.email = googleUser.getBasicProfile().getEmail();
  userProfile.imageUrl = googleUser.getBasicProfile().getImageUrl();
  urs = googleUser;
  var profile = googleUser.getBasicProfile();
  console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log("Name: " + profile.getName());
  console.log("Image URL: " + profile.getImageUrl());
  console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.

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
