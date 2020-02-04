<template>
  <div class="login">
    <h2>Sign Up</h2>
    <p v-if="error" @dismissed="onDismissed">Error</p>
    <form @submit.prevent="onSignup">
      <p>Email</p>
      <input name="email" label="E-mail" id="email" v-model="email" type="email" required />
      <p>Username</p>
      <input name="username" label="Username" id="username" v-model="username" type="text" required />
      <p>Date of Birth</p>
      <datepicker placeholder="Select Date" v-model="dob"></datepicker>
      <p>Password</p>
      <input
        name="password"
        label="Password"
        id="password"
        v-model="password"
        type="password"
        required
      />
      <p>Confirm Password</p>
      <input
        name="confirmPassword"
        label="Validate Password"
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        required
      />
      <button type="submit" :loading="loading">Register</button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.login {
  border: 1px solid black;
  border-radius: 5px;
  padding: 1.5rem;
  width: 300px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
  .container-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
    img {
      width: 2rem;
      height: 2rem;
    }
  }
  form {
    display: flex;
    flex-flow: column;
    *:not(:last-child) {
      margin-bottom: 1rem;
    }
    input {
      padding: 0.5rem;
    }
    button {
      padding: 0.5rem;
      background-color: lightgray;
      border: 1px solid gray;
      border-radius: 3px;
      cursor: pointer;
      &:hover {
        background-color: lightslategray;
      }
    }
  }
}
</style>

<script>
import Datepicker from "vuejs-datepicker";

export default {
  data() {
    return {
      email: "",
      username: "",
      password: "",
      age: 18,
      dob: new Date(),
      confirmPassword: ""
    };
  },
  components: {
    Datepicker
  },
  computed: {
    comparePasswords() {
      return this.password !== this.confirmPassword
        ? "Passwords do not match."
        : true;
    },
    user() {
      return this.$store.getters.user;
    },
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  watch: {
    user(value) {
      if (value !== null && value !== undefined) {
        this.$router.push("/");
      }
    }
  },
  methods: {
    onSignup() {
      this.age = this.getAge(this.dob);
      if (this.comparePasswords === true) {
        this.$store.dispatch("signUserUp", {
          email: this.email,
          password: this.password,
          username: this.username,
          age: this.age
        });
      } else {
        console.log(this.comparePasswords);
      }
    },
    onDismissed() {
      this.$store.dispatch("clearError");
    },
    getAge(birth) {
      var today = new Date();
      var nowyear = today.getFullYear();
      var nowmonth = today.getMonth();
      var nowday = today.getDate();

      var birthyear = birth.getFullYear();
      var birthmonth = birth.getMonth();
      var birthday = birth.getDate();

      var age = nowyear - birthyear;
      var age_month = nowmonth - birthmonth;
      var age_day = nowday - birthday;

      if (age_month < 0 || (age_month == 0 && age_day < 0)) {
        age = parseInt(age) - 1;
      }
      this.age = age;
      console.log(this.age);
      return age;
    }
  },
  updated() {
    if (this.error) console.log(this.error.message);
  }
};
</script>