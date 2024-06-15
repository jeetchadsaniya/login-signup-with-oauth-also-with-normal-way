const form = document.getElementsByTagName("form")[0];
const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");

async function submitForm(event) {
  event.preventDefault();
  try {
    let response = await fetch("http://127.0.0.1:5000/api/v1/user/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname: fullname.value,
        email: email.value,
        password: password.value,
      }),
    });
    response = await response.json();
    if (response.statusCode != 200) {
      throw new Error(response.message);
    }
    alert(response.message);
    window.location.href = "../pages/login.html";
  } catch (error) {
    if (error.message == "User already exists") {
      alert(error.message);
      window.location.href = "../pages/login.html";
      return;
  }
    alert(error.message);
  }
}

form.addEventListener("submit", submitForm);
