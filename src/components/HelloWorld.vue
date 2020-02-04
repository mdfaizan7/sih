<template>
  <div
    class="chatbox"
    id="app"
    @click="
		showOptions = false
		showUserMenu = false
		showColorPalette = false"
    :class="darkMode ? 'darkMode':''"
  >
    <div class="chatbox_popupMenu" v-show="showOptions">
      <button @click="darkMode = !darkMode">Dark mode {{darkMode? 'Off':'On'}}</button>
      <button
        @click.stop.prevent="showColorPalette = true; showOptions = false"
      >Change channel color</button>
      <button
        @click="deleteCurrentChannel()"
        :disabled="selectedContact.selectedChannelIndex === 0"
      >Delete current channel</button>
    </div>
    <div class="chatbox_colorPalette" v-show="showColorPalette">
      <div class="chatbox_color" v-for="i in 12" v-bind:key="i.index" @click="changeChannelColor"></div>
    </div>
    <ul class="chatbox_contacts">
      <li
        class="chatbox_contact"
        v-for="(contact, contactIndex) in contacts"
        v-bind:key="contactIndex"
        data-tooltip="contact.name"
        :style="{'background-image': 'url(' + contact.profileImage + ')'}"
        :class="contactIndex === selectedContactIndex ? 'chatbox_contact--selected':''"
        @click="selectedContactIndex = contactIndex"
      >
        <div class="chatbox_onlineIndicator" v-if="contactIndex < 3"></div>
      </li>
      <li
        class="chatbox_contact"
        style="
				background-color: #f0f0f0;
				background-image: url('https://image.flaticon.com/icons/svg/149/149156.svg')
				background-position: center;
				background-size: 26px;
				background-repeat: no-repeat;
			;"
        @click="addContact()"
      ></li>
      <input
        v-if="showSearchBox"
        v-model="search"
        type="text"
        name="Search Box"
        placeholder="Search name"
      />
      <button v-if="showSearchBox" v-on:click="addChat">Submit</button>
      <div v-if="search!=''" style="overflow-y: scroll">
        <p v-for="u in filteredUsers" v-bind:key="u.index">{{ u.username }}</p>
      </div>
      <footer>
        <p>
          Made with 💖 by
          <a href="https://github.com/Pranjalya" target="_blank">Pranjalya Tiwari</a>
        </p>
        <br />
      </footer>
    </ul>
    <div class="chatbox_container">
      <div class="chatbox_userMenu" v-if="showUserMenu">
        <button
          @click="deleteCurrentContact()"
          :disabled="selectedContactIndex === 0"
        >Remove from contacts</button>
      </div>
      <div class="chatbox_info">
        <img
          src="https://image.flaticon.com/icons/svg/149/149452.svg"
          @click.stop.prevent="showUserMenu = !showUserMenu"
          height="26"
        />
        <h3>{{ contacts[selectedContactIndex].name }}</h3>
        <img src="../assets/video.svg" @click.stop.prevent="videoCall" height="26" />
        <img
          src="https://image.flaticon.com/icons/svg/149/149403.svg"
          height="24"
          width="22"
          @click.stop.prevent="showOptions = !showOptions; showColorPalette = false"
        />
      </div>
      <nav class="chatbox_navigation">
        <button
          class="chatbox_channelSwitchButton"
          v-for="(channel, channelIndex) in selectedContact.channels"
          v-bind:key="channelIndex"
          :class="channelIndex === selectedContact.selectedChannelIndex ? 'chatbox_channelSwitchButton--selected':''"
          :style="{
					backgroundColor: channelIndex === selectedContact.selectedChannelIndex ? selectedContact.channels[channelIndex].color:'initial',
					borderColor: selectedContact.channels[channelIndex].color,
					color: channelIndex !== selectedContact.selectedChannelIndex ? selectedContact.channels[channelIndex].color:'default'
				}"
          @click="selectedContact.selectedChannelIndex = channelIndex"
        >
          <p>{{ channel.name }}</p>
        </button>
        <button
          class="chatbox_channelSwitchButton chatbox_channelNewButton--input"
          v-if="selectedContact.makeNewChannel"
        >
          <input
            type="text"
            v-model="selectedContact.newChannelInput"
            name="newChannelInput"
            placeholder="Channel name"
            ref="newChannelInput"
            aria-label="New channel input"
            @blur="onChannelInputBlur()"
            @keyup.enter="newChannel(selectedContact.newChannelInput)"
          />
        </button>
        <button
          class="chatbox_channelNewButton"
          v-if="!selectedContact.makeNewChannel"
          @click="addButtonClick()"
        >
          <img src="https://image.flaticon.com/icons/svg/149/149156.svg" height="13" />
        </button>
      </nav>
      <div class="chatbox_chat">
        <input
          class="chatbox_messageInput"
          v-model="selectedContact.messageInput"
          ref="newMessageInput"
          :placeholder="firstMessageSent ? 'New message...':'New message...'"
          @keyup.enter="newMessage()"
        />
        <div ref="messageArea" class="chatbox_messages">
          <div
            v-for="(message, messageIndex) in selectedChannel.messages"
            v-bind:key="messageIndex"
          >
            <div
              class="chatbox_date"
              v-if="messageIndex === 0 || messageIndex > 0 && selectedChannel.messages[messageIndex - 1].date !== message.date"
            >{{message.date}}</div>
            <div
              class="chatbox_messageContainer"
              :class="message.authorId === userId ? 'chatbox_messageContainer--right':''"
              :style="{
							'margin-top': messageIndex > 0 && selectedChannel.messages[messageIndex - 1].authorId !== message.authorId ? '12px':'4px',
							'margin-bottom': messageIndex < (selectedChannel.messages.length - 1) && selectedChannel.messages[messageIndex + 1].authorId !== message.authorId ? '12px':'4px'
						}"
            >
              <div
                class="chatbox_message"
                aria-label="message.content"
                @click="checkToxicity(message.content)"
                :style="{
								'background-color': message.authorId === userId ? selectedChannel.color:'',
								'border-top-right-radius': (messageIndex > 0 && selectedChannel.messages[messageIndex - 1].authorId === userId && message.authorId === userId) ? '5px':'20px',
								'border-bottom-right-radius': (messageIndex < (selectedChannel.messages.length - 1) && selectedChannel.messages[messageIndex + 1].authorId === userId && message.authorId === userId) ? '5px':'20px',
								'border-top-left-radius': (messageIndex > 0 && selectedChannel.messages[messageIndex - 1].authorId === message.authorId && message.authorId !== userId) ? '5px':'20px',
								'border-bottom-left-radius': (messageIndex < (selectedChannel.messages.length - 1) && selectedChannel.messages[messageIndex + 1].authorId === message.authorId && message.authorId !== userId) ? '5px':'20px'
							}"
              >
                {{ message.content }}
                <div
                  class="chatbox_time"
                  :class="message.authorId === userId ? 'chatbox_time--left':''"
                >{{message.time}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as toxicity from "@tensorflow-models/toxicity";
import * as faceapi from "face-api.js";
var PouchDB = require("pouchdb").default;
var user = "";
const threshold = 0.9;

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  created() {
    this.userdb = new PouchDB(
      "https://4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix:2d0f75eae437887122aec87b1225ad19a294f459beeb0a20fd69fb333cee4d4a@4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix.cloudantnosqldb.appdomain.cloud/sih_users"
    );
    this.localdb = new PouchDB("localdb");
    this.remotedb = new PouchDB(
      "https://4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix:2d0f75eae437887122aec87b1225ad19a294f459beeb0a20fd69fb333cee4d4a@4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix.cloudantnosqldb.appdomain.cloud/sih_chats"
    );
    this.userdb
      .allDocs({
        include_docs: true,
        attachments: true
      })
      .then(result => {
        this.userList = [];
        for (let i = 0; i < result.rows.length; ++i) {
          if (result.rows[i].doc.username != user)
            this.userList.push(result.rows[i].doc);
        }
        console.log(this.userList);
      })
      .catch(err => {
        console.log(err);
      });
    console.log("User", this.$store.getters.user.email);
    this.userId = this.$store.getters.user.email;
    user = this.userId;
  },
  mounted() {
    this.remotedb
      .allDocs({
        include_docs: true,
        attachments: true
      })
      .then(result => {
        console.log("rows", result.rows);
        for (let i = 0; i < result.rows.length; ++i) {
          if (result.rows[i]._id == user) {
            if (result.rows[i].age <= 17) this.underage = true;
          } else {
            this.contacts.push(result.rows[i]);
            this.userList.push(result.rows[i].name);
          }
        }
      })
      .catch(err => {
        console.log(err);
      });

    this.monitorToxicity();
    this.changesMonitor();
  },
  updated() {
    var messageArea = this.$refs.messageArea;
    messageArea.scrollTop = messageArea.scrollHeight;
  },
  data() {
    return {
      search: "",
      showSearchBox: false,
      userList: [],
      userdb: {},
      localdb: {},
      remotedb: {},
      darkMode: true,
      showUserMenu: false,
      showOptions: false,
      userId: "",
      underage: false,
      firstMessageSent: false,
      showColorPalette: false,
      selectedContactIndex: 0,
      contacts: [
        {
          _id: "pranjalyawarrior@gmail.com",
          name: "Pranjalya Tiwari",
          age: 21,
          receiver: "",
          profileImage: "https://randomuser.me/api/portraits/men/85.jpg",
          userId: "pranjalyawarrior@gmail.com",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [
            {
              name: "MAIN",
              color: "#09f",
              messages: [
                {
                  content: "Hi, how are you?",
                  date: "2019-02-13",
                  time: "12:34",
                  authorId: "pranjalyawarrior@gmail.com"
                },
                {
                  content: "Welcome to the chat app with channels!",
                  date: "2019-02-13",
                  time: "12:35",
                  authorId: "pranjalyawarrior@gmail.com"
                },
                {
                  content: "channels?",
                  date: "2019-02-13",
                  time: "12:38",
                  authorId: user
                },
                {
                  content:
                    "yup! Sometimes when you chat with someone you'd like to talk about different topics simultaneously or save important notes or links somewhere - it's super easy with the channels",
                  date: "2019-02-13",
                  time: "12:39",
                  authorId: "pranjalyawarrior@gmail.com"
                },
                {
                  content: "sounds cool 😎",
                  date: "2019-02-13",
                  time: "12:40",
                  authorId: user
                },
                {
                  content: "it might be really useful",
                  date: "2019-02-13",
                  time: "12:40",
                  authorId: user
                },
                {
                  content: "let's try them out",
                  date: "2019-02-13",
                  time: "12:41",
                  authorId: user
                },
                {
                  content: "try to switch channels - click 'trip to Greece' ^",
                  date: "2019-02-13",
                  time: "12:45",
                  authorId: "pranjalyawarrior@gmail.com"
                }
              ]
            },
            {
              name: "trip to Greece",
              color: "#ff0f80",
              messages: [
                {
                  content:
                    "Why would we spam our main chat, when we can plan our trip here? 🛳️",
                  date: "2019-02-09",
                  time: "23:34",
                  authorId: "pranjalyawarrior@gmail.com"
                },
                {
                  content: "yeah, the channels are excellent!",
                  date: "2019-02-10",
                  time: "06:15",
                  authorId: user
                },
                {
                  content: "I've found a lovely Airbnb on Crete",
                  date: "2019-02-10",
                  time: "06:15",
                  authorId: user
                },
                {
                  content: "link?",
                  date: "2019-02-10",
                  time: "06:23",
                  authorId: "pranjalyawarrior@gmail.com"
                }
              ]
            },
            {
              name: "homework",
              color: "rgb(36, 123, 160)",
              messages: [
                {
                  content: "what do we have to do for tommorow?",
                  date: "2019-02-13",
                  time: "17:34",
                  authorId: "pranjalyawarrior@gmail.com"
                },
                {
                  content:
                    "maths - exercises 2.314, 2.316 abc, 2.317 d | physics - read about centripetal force",
                  date: "2019-02-13",
                  time: "17:55",
                  authorId: user
                },
                {
                  content: "thanks!",
                  date: "2019-02-13",
                  time: "18:23",
                  authorId: "pranjalyawarrior@gmail.com"
                }
              ]
            },
            { name: "dank memes", color: "rgb(241, 154, 62)", messages: [] }
          ]
        }
      ]
    };
  },
  computed: {
    selectedContact() {
      return this.contacts[this.selectedContactIndex];
    },
    selectedChannel() {
      return this.contacts[this.selectedContactIndex].channels[
        this.contacts[this.selectedContactIndex].selectedChannelIndex
      ];
    },
    filteredUsers() {
      return this.userList.filter(userName => {
        return userName.username.match(this.search);
      });
    }
  },
  methods: {
    addContact() {
      this.showSearchBox = true;
    },
    addChat() {
      var toAdd = "";
      for (let i = 0; i < this.userList.length; ++i) {
        if (this.userList[i].username == this.search) {
          this.contacts.push({
            _id: this.userList[i].email,
            name: this.userList[i].username,
            age: this.userList[i].age,
            receiver: user,
            profileImage: "https://randomuser.me/api/portraits/men/88.jpg",
            userId: this.userList[i].email,
            newChannelInput: "",
            messageInput: "",
            makeNewChannel: false,
            selectedChannelIndex: 0,
            channels: [
              {
                name: "MAIN",
                color: "#09f",
                messages: []
              }
            ]
          });
          break;
        }
      }
    },
    addButtonClick() {
      this.selectedContact.makeNewChannel = true;
      this.$nextTick(() => {
        this.$refs.newChannelInput.focus();
      });
    },
    newChannel(name) {
      if (name.length > 0) {
        this.selectedContact.channels.push({
          name: this.selectedContact.newChannelInput,
          color: "#09f",
          messages: []
        });
        this.selectedContact.newChannelInput = "";
        this.selectedContact.makeNewChannel = false;
        this.selectedContact.selectedChannelIndex =
          this.selectedContact.channels.length - 1;
        this.$refs.newMessageInput.focus();
      }
    },
    onChannelInputBlur() {
      if (this.selectedContact.newChannelInput === "") {
        this.selectedContact.makeNewChannel = false;
      } else {
        this.newChannel(this.selectedContact.newChannelInput);
      }
    },
    changeChannelColor(event) {
      let newColor = window.getComputedStyle(event.target).backgroundColor;
      this.selectedChannel.color = newColor;
    },
    deleteCurrentChannel() {
      let channelIndex = this.contacts[this.selectedContactIndex]
        .selectedChannelIndex;
      if (channelIndex > 0) {
        // Can't delete the main channel
        this.selectedContact.selectedChannelIndex = 0;
        this.selectedContact.channels.splice(channelIndex, 1);
        this.showOptions = false;
      }
    },
    deleteCurrentContact() {
      this.contacts.splice(this.selectedContactIndex, 1);
      if (this.selectedContactIndex > 0) {
        this.selectedContactIndex--;
      }
    },
    newMessage() {
      console.log("New message entered");
      if (this.selectedContact.messageInput.length > 0) {
        let today = new Date();
        this.selectedContact.channels[
          this.contacts[this.selectedContactIndex].selectedChannelIndex
        ].messages.push({
          content: this.selectedContact.messageInput,
          authorId: user,
          time: this.getTime(),
          date: this.getDate()
        });

        this.firstMessageSent = true;
        this.selectedContact.messageInput = "";

        this.remotedb
          .allDocs({
            include_docs: true,
            attachments: true
          })
          .then(result => {
            console.log("rows", result.rows);
            this.contacts = result.rows;
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    closePopup() {
      if (this.showOptions) {
        console.log("loser");
        this.showOptions = false;
      }
    },
    getDate() {
      let date = new Date();
      return (
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1 < 10 ? "0" : "") +
        (date.getMonth() + 1) +
        "-" +
        (date.getDate() < 10 ? "0" : "") +
        date.getDate()
      );
    },
    getTime() {
      let date = new Date();
      return (
        (date.getHours() < 10 ? "0" : "") +
        date.getHours() +
        ":" +
        (date.getMinutes() < 10 ? "0" : "") +
        date.getMinutes()
      );
    },
    changesMonitor() {
      console.log("Change Monitor started");
      this.remotedb
        .changes({
          since: "now",
          live: true,
          include_docs: true
        })
        .on("change", change => {
          console.log("Remote changes", change.doc);
          let done = false;
          for (let i = 0; i < this.contacts.length; ++i) {
            if (change.doc._id == this.contacts[i]._id) {
              this.contacts[i] = change.doc;
              done = true;
              break;
            }
          }
          if (!done) {
            this.contacts.push(change.doc);
          }
        })
        .on("error", error => {
          console.log("Change error", err);
        });

      this.userdb
        .allDocs({
          include_docs: true,
          attachments: true
        })
        .then(result => {
          this.userList = [];
          for (let i = 0; i < result.rows.length; ++i) {
            if (result.rows[i].doc.username != user)
              this.userList.push(result.rows[i].doc);
          }
          console.log(this.userList);
        })
        .catch(err => {
          console.log(err);
        });
    },
    monitorToxicity() {},

    classifyToxicity(input, model) {
      console.log("input ", input);
      return model.classify(input).then(predictions => {
        return predictions
          .map(p => {
            const label = p.label;
            const match = p.results[0].match;
            const prediction = p.results[0].probabilities[1];
            console.log(label + ": " + match + "(" + prediction + ")");
            return match != false && prediction > 0.5;
          })
          .some(label => label);
      });
    },

    checkToxicity(msg) {
      console.log(msg);
      console.log("Toxicity", toxicity);
      toxicity.load(threshold).then(model => {
        /*  model.classify(msg).then(predictions => {
          console.log("Predictions", predictions);
          var toxics = [];
          for (let j = 0; j < predictions.length; ++j) {
            if (predictions[j].results.match == true) {
              toxics.push(predictions[j].label);
              console.log(toxics);
            }
            alert(toxics);
          }
        });
      });   */
        this.classifyToxicity(msg, model).then(result => {
          if(result) {
            alert("That's some toxic content");
          }
          console.log(result);
        });
      });
    },

    videoCall() {
      console.log(
        "user",
        this.userId,
        "receiver",
        this.contacts[this.selectedContactIndex].userId
      );
      this.$router.push({
        name: "videocall",
        params: {
          sender: this.userId,
          receiver: this.contacts[this.selectedContactIndex].userId
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
@import url("https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700");
a:focus,
a:active,
button::-moz-focus-inner,
input[type="reset"]::-moz-focus-inner,
input[type="button"]::-moz-focus-inner,
input[type="submit"]::-moz-focus-inner,
select::-moz-focus-inner,
input[type="file"] > input[type="button"]::-moz-focus-inner {
  border: 0;
  outline: 0;
}
* {
  box-sizing: border-box;
  text-align: center;
}
*:focus {
  outline: none;
}
p {
  margin: 0;
}
html,
body {
  margin: 0;
  font-size: 13px;
  height: 100%;
  font-family: "Open Sans", sans-serif;
  overflow: hidden;
}
footer {
  width: 100%;
  background: #fff;
  font-size: 10px;
  color: #bbb;
}
footer a {
  text-decoration: none;
  color: #999;
}
.chatbox {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
}
.chatbox_contacts {
  display: inline-block;
  height: 100%;
  width: 175px;
  padding: 10px;
  border-right: 1px solid #f2f2f2;
  /*  overflow-y: auto; */
}
.chatbox_contact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 5px;
  height: 55px;
  width: 55px;
  border-radius: 40px;
  cursor: pointer;
  border: 2px solid #fff;
  background-size: cover;
  background-position: center;
  background-color: #e6e6e6;
  transition-duration: 0.1s;
}
.chatbox_contact:hover {
  box-shadow: 0 0 0 2px #eee;
}
.chatbox_contact--selected {
  box-shadow: 0 0 0 2px #09f !important;
}
.chatbox_onlineIndicator {
  position: absolute;
  width: 16px;
  height: 16px;
  right: 0;
  bottom: 0;
  background-color: #2de58d;
  border-radius: 50px;
  border: 2px solid #fff;
}
.chatbox_container {
  position: relative;
  width: calc(100% - 175px);
  height: 100%;
}
.chatbox_info,
.chatbox_navigation {
  align-self: flex-start;
  width: 100%;
  border-bottom: 1px solid #f2f2f2;
}
.chatbox_info {
  padding: 10px 10px;
  /*  position: fixed; */
  display: flex;
  font-family: "Vollkorn";
  align-items: center;
  text-transform: capitalize;
  justify-content: space-between;
}
.chatbox_info img {
  cursor: pointer;
}
.chatbox_navigation {
  display: flex;
  height: auto;
  align-items: center;
  text-align: left;
  padding: 8px 10px;
}
.chatbox_channelSwitchButton,
.chatbox_channelNewButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  font-weight: 400;
  white-space: nowrap;
  border-radius: 40px;
  margin: 0 9px 0 0;
  font-size: 11px;
  height: 25px;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #09f;
  color: #09f;
  cursor: pointer;
}
.chatbox_channelSwitchButton input,
.chatbox_channelNewButton input {
  margin: 0;
  padding: 0 4px;
  border: none;
  height: 100%;
  width: 96px;
  text-align: left;
  font: inherit;
}
.chatbox_channelSwitchButton input::placeholder,
.chatbox_channelNewButton input::placeholder {
  color: #bbb;
}
.chatbox_channelSwitchButton--selected,
.chatbox_channelNewButton--selected {
  background: #09f;
  color: #fff !important;
}
.chatbox_channelSwitchButton--input,
.chatbox_channelNewButton--input {
  padding: 0 8px;
  cursor: default;
  display: flex;
}
.chatbox_channelNewButton {
  border-color: #e4e4e4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  height: 25px;
  width: 25px;
  color: #555;
  font-weight: 100;
  font-size: 22px;
  transition-duration: 0.1s;
}
.chatbox_channelNewButton:hover {
  border-color: #aaa;
}
.chatbox_chat {
  position: relative;
  height: calc(100% - 78px);
}
.chatbox_messages {
  margin: 0 auto;
  height: 500px;
  padding: 20px;
  font-size: 20px;
  padding-bottom: 75px;
  overflow-y: scroll;
}
.chatbox_messageInput {
  position: absolute;
  display: block;
  font: inherit;
  font-size: 20px;
  text-align: left;
  position: absolute;
  margin: 0 auto;
  right: 0;
  left: 0;
  height: 37px;
  padding: 2px 19px;
  width: 450px;
  border-radius: 50px;
  border: 1px solid #e4e4e4;
  bottom: 26px;
  z-index: 2;
}
.chatbox_messageInput::placeholder {
  color: #bbb;
}
.chatbox_messageContainer {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 6px 0;
  justify-content: flex-start;
}
.chatbox_messageContainer--right {
  justify-content: flex-end;
}
.chatbox_messageContainer--right .chatbox_message {
  color: #fff;
  border: none;
}
.chatbox_message {
  position: relative;
  max-width: 400px;
  padding: 6px 15px;
  text-align: left;
  border-radius: 20px;
  z-index: 4500;
  font-size: 20px;
  color: #000;
  word-break: break-word;
  background-color: #f4f4f4;
}
.chatbox_message:hover .chatbox_time {
  display: block;
}
.chatbox_time {
  display: none;
  position: absolute;
  color: #ccc;
  right: -38px;
  top: calc(50% - 9px);
}
.chatbox_time--left {
  left: -38px;
  right: auto;
}
.chatbox_date {
  width: 100%;
  height: 20px;
  text-align: center;
  margin: 13px 0 10px;
  font-size: 12px;
  color: #ccc;
}
.chatbox_date:nth-child(1) {
  margin-top: 0;
}
.chatbox_popupMenu,
.chatbox_colorPalette,
.chatbox_userMenu {
  position: absolute;
  right: 10px;
  top: 40px;
  background: #fff;
  width: 200px;
  border-radius: 5px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
  z-index: 2;
}
.chatbox_popupMenu button,
.chatbox_colorPalette button,
.chatbox_userMenu button {
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  background-color: #fff;
  border: none;
}
.chatbox_popupMenu button:hover,
.chatbox_colorPalette button:hover,
.chatbox_userMenu button:hover {
  background: #f4f4f4;
}
.chatbox_popupMenu button:last-child,
.chatbox_colorPalette button:last-child,
.chatbox_userMenu button:last-child {
  color: #f00;
}
.chatbox_popupMenu button:disabled,
.chatbox_colorPalette button:disabled,
.chatbox_userMenu button:disabled,
.chatbox_popupMenu button button[disabled],
.chatbox_colorPalette button button[disabled],
.chatbox_userMenu button button[disabled] {
  cursor: default;
  color: #bbb;
}
.chatbox_popupMenu button:disabled:hover,
.chatbox_colorPalette button:disabled:hover,
.chatbox_userMenu button:disabled:hover,
.chatbox_popupMenu button button[disabled]:hover,
.chatbox_colorPalette button button[disabled]:hover,
.chatbox_userMenu button button[disabled]:hover {
  background: #fff;
}
.chatbox_colorPalette {
  width: auto;
  padding: 9px;
  display: grid;
  grid-template: 1fr 1fr 1fr/1fr 1fr 1fr 1fr;
  grid-gap: 5px;
}
.chatbox_userMenu {
  right: auto;
  left: 10px;
}
.chatbox_color {
  width: 25px;
  height: 25px;
  border-radius: 30px;
  cursor: pointer;
}
.chatbox_color:hover {
  opacity: 0.9;
}
.chatbox_color:nth-child(1) {
  background-color: #ff7ca8;
}
.chatbox_color:nth-child(2) {
  background-color: #247ba0;
}
.chatbox_color:nth-child(3) {
  background-color: #70c1b3;
}
.chatbox_color:nth-child(4) {
  background-color: #b2dbbf;
}
.chatbox_color:nth-child(5) {
  background-color: #ff1654;
}
.chatbox_color:nth-child(6) {
  background-color: #ffba08;
}
.chatbox_color:nth-child(7) {
  background-color: #3f88c5;
}
.chatbox_color:nth-child(8) {
  background-color: #23bf73;
}
.chatbox_color:nth-child(9) {
  background-color: #ff0f80;
}
.chatbox_color:nth-child(10) {
  background-color: #fe4e00;
}
.chatbox_color:nth-child(11) {
  background-color: #f19a3e;
}
.chatbox_color:nth-child(12) {
  background-color: #09f;
}
.darkMode {
  color: #fff;
  background: #222;
}
.darkMode footer,
.darkMode .chatbox_info,
.darkMode .chatbox_navigation,
.darkMode .chatbox_channelSwitchButton,
.darkMode .chatbox_channelNewButton,
.darkMode .chatbox_colorPalette,
.darkMode .chatbox_userMenu {
  color: #fff;
  background: #222;
}
.darkMode .chatbox_contacts,
.darkMode .chatbox_contact,
.darkMode .chatbox_info,
.darkMode .chatbox_navigation {
  border-color: #444;
}
.darkMode .chatbox_message {
  background: #444;
  color: #fff;
}
.darkMode .chatbox_messageInput {
  background: #444;
  color: #fff;
}
.darkMode .chatbox_channelNewButton img,
.darkMode .chatbox_info img,
.darkMode .chatbox_navigation img {
  filter: invert(100%);
}
@media screen and (max-width: 600px) {
  .chatbox_contacts {
    width: 85px;
  }
  .chatbox_container {
    width: calc(100% - 85px);
  }
}
@media screen and (max-width: 640px) {
  .chatbox_messageInput {
    width: 290px;
  }
}
::-webkit-scrollbar {
  width: 0px; /* Remove scrollbar space */
  background: transparent; /* Optional: just make scrollbar invisible */
}
/* Optional: show position indicator in red */
::-webkit-scrollbar-thumb {
  background: #ff0000;
}
input[type="text"] {
  background-color: #f1f1f1;
  width: 100%;
}
[data-tooltip]:before {
  /* needed - do not touch */
  content: attr(data-tooltip);
  position: absolute;
  opacity: 0;

  /* customizable */
  transition: all 0.15s ease;
  padding: 10px;
  color: #333;
  border-radius: 10px;
  box-shadow: 2px 2px 1px silver;
}

[data-tooltip]:hover:before {
  /* needed - do not touch */
  opacity: 1;

  /* customizable */
  background: yellow;
  margin-top: -50px;
  margin-left: 20px;
}

[data-tooltip]:not([data-tooltip-persistent]):before {
  pointer-events: none;
}
</style>
