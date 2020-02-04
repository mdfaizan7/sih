import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import * as firebase from 'firebase'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
  created () {
    firebase.initializeApp({
      apiKey: "AIzaSyAV1Nga9k-QpypXm1x1UnjG2aNxZ8ZziH0",
      authDomain: "sih-chat-267014.firebaseapp.com",
      databaseURL: "https://sih-chat-267014.firebaseio.com",
      projectId: "sih-chat-267014",
      storageBucket: "sih-chat-267014.appspot.com",
    })
  }
}).$mount('#app')
