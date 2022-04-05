function onSignIn(googleUser) {
  userProfile.id_token = googleUser.getAuthResponse().id_token;

  userProfile.name = googleUser.getBasicProfile().getName();
  userProfile.email = googleUser.getBasicProfile().getEmail();
  userProfile.imageUrl = googleUser.getBasicProfile().getImageUrl();
  urs = googleUser;
  var profile = googleUser.getBasicProfile();

  document.getElementById("login-page").style.display = "none";
  
}
