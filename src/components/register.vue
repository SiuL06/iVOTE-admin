<template>
  <div class="constraint-layout">
    <img
      id="imageViewBackground"
      class="background-image"
      src="@/assets/facade1.png"
      alt="Background"
    />

    <div class="register-container">
      <h2>Register to iVote!</h2>
      <form @submit.prevent="submitForm">
        <div class="input-group">
          <input type="text" placeholder="First Name" v-model="firstName" required />
        </div>
        <div class="input-group">
          <input type="text" placeholder="Last Name" v-model="lastName" required />
        </div>
        <div class="input-group">
          <input type="email" placeholder="Email" v-model="email" required />
        </div>
        <div class="input-group">
          <input type="password" placeholder="Password" v-model="password" required />
        </div>
        <div class="input-group">
          <input type="date" v-model="birthdate" required />
        </div>
        <div class="input-group gender-group">
          <label>Gender:</label>
          <input type="radio" id="male" name="gender" value="male" v-model="gender" required />
          <label for="male">Male</label>
          <input type="radio" id="female" name="gender" value="female" v-model="gender" required />
          <label for="female">Female</label>
        </div>
        <button type="button" class="btn-login" :disabled="isLoading" @click="submitForm">
          <span v-if="isLoading">Registering...</span>
          <span v-else>Register</span>
        </button>
        <div class="extra-links">
          <a href="login" class="sign-up">Already have an account? <span>Sign in</span></a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { auth, db } from '@/firebase'; // Ensure correct import of Firebase services
import { createUserWithEmailAndPassword } from 'firebase/auth'; // For creating user
import { setDoc, doc } from 'firebase/firestore'; // For Firestore document handling

export default {
  name: 'RegisterPage',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthdate: '',
      gender: '',
      isLoading: false // Loading state
    };
  },
  methods: {
    async submitForm(e) {
      e.preventDefault(); // Prevent default form submission behavior
      this.isLoading = true; // Start loading

      try {
        // Validate required fields
        if (!this.firstName || !this.lastName || !this.email || !this.password || !this.birthdate || !this.gender) {
          alert('Please fill in all the required fields');
          this.isLoading = false; // Stop loading
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          alert('Please enter a valid email address.');
          this.isLoading = false; // Stop loading
          return;
        }

        // Create user with email and password in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // Store additional user information in Firestore
        await setDoc(doc(db, "users", user.uid), {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          birthdate: this.birthdate,
          gender: this.gender
        });

        alert("Registration successful!");
        this.clearForm();
        this.$router.push('/login');

      } catch (error) {
        console.error("Full error object:", error);
        switch (error.code) {
          case 'auth/email-already-in-use':
            alert('This email is already in use. Please use a different email.');
            break;
          case 'auth/invalid-email':
            alert('Invalid email format.');
            break;
          case 'auth/weak-password':
            alert('Password should be at least 6 characters.');
            break;
          default:
            alert("Registration failed: " + error.message);
        }
      } finally {
        this.isLoading = false; // Stop loading
      }
    },
    clearForm() {
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.password = '';
      this.birthdate = '';
      this.gender = '';
    }
  }
};
</script>

<style scoped>
* {
  font-family: agrandir;
}

@font-face {
  font-family: agrandir;
  src: url('@/assets/agrandir.otf');
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Prevent any scrollbars */
}

.constraint-layout {
  position: fixed; /* Fix the layout to the screen */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center; /* Center the registration form horizontally */
  align-items: center; /* Center the registration form vertically */
  background-color: #000;
}

.background-image {
  position: fixed; /* Fixed background */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure the image covers the full screen */
  z-index: -1;
}

.register-container {
  z-index: 2; /* Ensure the container stays above the background */
  width: 100%;
  max-width: 400px; /* Maximum width of the registration container */
  padding: 20px;
  background: rgba(0, 0, 0, 0.6); /* Slightly transparent black background */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  color: rgb(255, 255, 255);
  justify-content: center;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.gender-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  margin-right: 10px;
}

.btn-login {
  width: 100%;
  padding: 10px;
  background-color: #747474;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-login:hover {
  background-color: #444;
}

.extra-links {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.extra-links a {
  text-decoration: none;
  color: white;
  transition: 0.3s;
}

.extra-links a:hover {
  text-decoration: underline;
}
</style>
