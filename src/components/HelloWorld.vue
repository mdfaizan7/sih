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
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  updated() {
    var messageArea = this.$refs.messageArea;
    messageArea.scrollTop = messageArea.scrollHeight;
  },
  data() {
    return {
      darkMode: false,
      showUserMenu: false,
      showOptions: false,
      userId: "FExpl9n",
      firstMessageSent: false,
      showColorPalette: false,
      selectedContactIndex: 0,
      contacts: [
        {
          name: "Pranjalya Tiwari",
          profileImage: "https://randomuser.me/api/portraits/men/85.jpg",
          userId: "umYHX3R",
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
                  authorId: "umYHX3R"
                },
                {
                  content: "Welcome to the chat app with channels!",
                  date: "2019-02-13",
                  time: "12:35",
                  authorId: "umYHX3R"
                },
                {
                  content: "channels?",
                  date: "2019-02-13",
                  time: "12:38",
                  authorId: "FExpl9n"
                },
                {
                  content:
                    "yup! Sometimes when you chat with someone you'd like to talk about different topics simultaneously or save important notes or links somewhere - it's super easy with the channels",
                  date: "2019-02-13",
                  time: "12:39",
                  authorId: "umYHX3R"
                },
                {
                  content: "sounds cool 😎",
                  date: "2019-02-13",
                  time: "12:40",
                  authorId: "FExpl9n"
                },
                {
                  content: "it might be really useful",
                  date: "2019-02-13",
                  time: "12:40",
                  authorId: "FExpl9n"
                },
                {
                  content: "let's try them out",
                  date: "2019-02-13",
                  time: "12:41",
                  authorId: "FExpl9n"
                },
                {
                  content: "try to switch channels - click 'trip to Greece' ^",
                  date: "2019-02-13",
                  time: "12:45",
                  authorId: "umYHX3R"
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
                  authorId: "umYHX3R"
                },
                {
                  content: "yeah, the channels are excellent!",
                  date: "2019-02-10",
                  time: "06:15",
                  authorId: "FExpl9n"
                },
                {
                  content: "I've found a lovely Airbnb on Crete",
                  date: "2019-02-10",
                  time: "06:15",
                  authorId: "FExpl9n"
                },
                {
                  content: "link?",
                  date: "2019-02-10",
                  time: "06:23",
                  authorId: "umYHX3R"
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
                  authorId: "umYHX3R"
                },
                {
                  content:
                    "maths - exercises 2.314, 2.316 abc, 2.317 d | physics - read about centripetal force",
                  date: "2019-02-13",
                  time: "17:55",
                  authorId: "FExpl9n"
                },
                {
                  content: "thanks!",
                  date: "2019-02-13",
                  time: "18:23",
                  authorId: "umYHX3R"
                }
              ]
            },
            { name: "dank memes", color: "rgb(241, 154, 62)", messages: [] }
          ]
        },
        {
          name: "Lucy Smith",
          userId: "jY0ty9S",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          profileImage: "https://randomuser.me/api/portraits/women/65.jpg",
          channels: [
            {
              name: "MAIN",
              color: "#09f",
              messages: [
                {
                  content: "Heey ;)",
                  date: "2019-02-06",
                  time: "17:19",
                  authorId: "jY0ty9S"
                }
              ]
            },
            {
              name: "random talks",
              color: "#09f",
              messages: [
                {
                  content: "I like dinosaurs",
                  date: "2019-02-09",
                  time: "23:34",
                  authorId: "jY0ty9S"
                },
                {
                  content: "me too!",
                  date: "2019-02-09",
                  time: "23:35",
                  authorId: "FExpl9n"
                }
              ]
            },
            {
              name: "channel3",
              color: "#09f",
              messages: [
                {
                  content: "what are we gonna use this channel for?",
                  date: "2019-02-07",
                  time: "14:34",
                  authorId: "jY0ty9S"
                },
                {
                  content: "dunno",
                  date: "2019-02-07",
                  time: "14:35",
                  authorId: "FExpl9n"
                },
                {
                  content: "hmm let's leave it empty",
                  date: "2019-02-07",
                  time: "18:56",
                  authorId: "jY0ty9S"
                }
              ]
            }
          ]
        },
        {
          name: "Natasha Brown",
          userId: "adf8iOc",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          profileImage: "https://randomuser.me/api/portraits/women/43.jpg",
          selectedChannelIndex: 0,
          channels: [
            {
              name: "MAIN",
              color: "#09f",
              messages: [
                {
                  content:
                    "Lorem Ipsum dolor sit amet oh my god I have no idea what should I write here lol",
                  date: "2018-09-12",
                  time: "12:45",
                  authorId: "adf8iOc"
                },
                {
                  content: "making fake messages might be really boring",
                  date: "2018-09-13",
                  time: "08:23",
                  authorId: "FExpl9n"
                }
              ]
            }
          ]
        },
        {
          name: "Charles Spruce",
          newChannelInput: "",
          makeNewChannel: false,
          messageInput: "",
          profileImage:
            "https://avatars2.githubusercontent.com/u/1695865?s=460&v=4",
          userId: "thearchitect",
          selectedChannelIndex: 0,
          channels: [
            {
              name: "MAIN",
              color: "#09f",
              messages: [
                {
                  content:
                    "Hi! 👋 I'm the author of this chat app. If you like it, please hit the 💖 button ^ thanks!",
                  date: "2020-03-12",
                  time: "00:00",
                  authorId: "thearchitect"
                }
              ]
            }
          ]
        },
        {
          name: "babür aclan",
          profileImage: "https://randomuser.me/api/portraits/med/men/18.jpg",
          userId: null,
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "vicky brady",
          profileImage: "https://randomuser.me/api/portraits/med/women/91.jpg",
          userId: "6981389T",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "enver gottschlich",
          profileImage: "https://randomuser.me/api/portraits/med/men/22.jpg",
          userId: null,
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "abbie richardson",
          profileImage: "https://randomuser.me/api/portraits/med/women/58.jpg",
          userId: "ES 63 66 39 F",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "debra foster",
          profileImage: "https://randomuser.me/api/portraits/med/women/84.jpg",
          userId: "EW 54 98 10 P",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "rena beer",
          profileImage: "https://randomuser.me/api/portraits/med/women/12.jpg",
          userId: null,
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "nicklas netland",
          profileImage: "https://randomuser.me/api/portraits/med/men/4.jpg",
          userId: "02105748674",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "alma møller",
          profileImage: "https://randomuser.me/api/portraits/med/women/45.jpg",
          userId: "953147-1893",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
        },
        {
          name: "paige fox",
          profileImage: "https://randomuser.me/api/portraits/med/women/5.jpg",
          userId: "4371535T",
          newChannelInput: "",
          messageInput: "",
          makeNewChannel: false,
          selectedChannelIndex: 0,
          channels: [{ name: "MAIN", color: "#09f", messages: [] }]
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
    }
  },
  methods: {
    addContact() {
      axios.get("https://randomuser.me/api/").then(response => {
        let contact = response.data.results[0];
        this.contacts.push({
          name: contact.name.first + " " + contact.name.last,
          profileImage: contact.picture.medium,
          userId: contact.id.value,
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
      });
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
      let url = "https://api.adviceslip.com/advice";
      if (this.selectedContact.messageInput.length > 0) {
        let today = new Date();
        this.selectedContact.channels[
          this.contacts[this.selectedContactIndex].selectedChannelIndex
        ].messages.push({
          content: this.selectedContact.messageInput,
          authorId: this.userId,
          time: this.getTime(),
          date: this.getDate()
        });
        this.firstMessageSent = true;
        this.selectedContact.messageInput = "";

        if (Math.floor(Math.random() * 3) === 1) {
          axios.get(url).then(response => {
            this.selectedChannel.messages.push({
              content: response.data.slip.advice,
              authorId: this.selectedContact.userId,
              time: this.getTime(),
              date: this.getDate()
            });
          });
        }
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
  overflow-y: auto;
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
  font-family: 'Vollkorn';
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
</style>
