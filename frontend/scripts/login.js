const form = document.getElementsByTagName("form")[0];
const email = document.getElementById("email");
const password = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");
const loginWithGoogle = document.getElementById("login-with-google");

async function submitForm(event) {
  event.preventDefault();
  try {
    let response = await fetch("http://127.0.0.1:5000/api/v1/user/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        rememberMe: rememberMe.checked,
      }),
    });
    response = await response.json();
    if (response.statusCode != 200) {
      throw new Error(response.message);
    }
    alert(response.message);
    window.location.href = "../pages/dashboard.html";
  } catch (error) {
    if (error.message == "User not signed up") {
      alert(error.message);
      window.location.href = "../pages/signup.html";
      return;
    }
    alert(error.message);
  }
}

function getGoogleOAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: "http://127.0.0.1:5000/api/v1/user/sessions/oauth/google",
    client_id:
      "986117286256-7g3juqcpunehofkiba3l0vmp41ruejh3.apps.googleusercontent.com",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

form.addEventListener("submit", submitForm);
loginWithGoogle.addEventListener("click", () => {
  window.location.href = getGoogleOAuthURL();
});