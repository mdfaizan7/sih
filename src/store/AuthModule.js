import * as firebase from 'firebase'
var PouchDB = require('pouchdb').default;

const AuthModule = {
    state: {
        user: null
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload
            const userListRef = firebase.database().ref('presence')
            const myUserRef = userListRef.push()

            firebase.database().ref('.info/connected')
                .on(
                    'value', function (snap) {
                        if (snap.val()) {
                            // if we lose network then remove this user from the list
                            myUserRef.onDisconnect().remove()
                            // set user's online status
                            let presenceObject = { user: payload, status: 'online' }
                            myUserRef.set(presenceObject)
                        } else {
                            // client has lost network
                            let presenceObject = { user: payload, status: 'offline' }
                            myUserRef.set(presenceObject)
                        }
                    }
                )
        }
    },
    actions: {
        signUserUp({ commit }, payload) {
            commit('setLoading', true)
            var userdb = new PouchDB(
                "https://4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix:2d0f75eae437887122aec87b1225ad19a294f459beeb0a20fd69fb333cee4d4a@4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix.cloudantnosqldb.appdomain.cloud/sih_users"
            );
            commit('clearError')
            firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
                .then(
                    auth => {
                        firebase.database().ref('users').child(auth.user.uid).set({
                            name: payload.username
                        })
                            .then(
                                message => {
                                    userdb.put({
                                        _id: payload.email,
                                        username: payload.username,
                                        age: payload.age,
                                        email: payload.email
                                    }).then(result => { console.log("User registered") }).catch(err => console.log);
                                    commit('setLoading', false)
                                    const newUser = {
                                        id: auth.user.uid,
                                        username: payload.username
                                    }
                                    commit('setUser', newUser)
                                }
                            )
                            .catch(
                                error => {
                                    commit('setLoading', false)
                                    commit('setError', error)
                                }
                            )
                    }
                )
                .catch(
                    error => {
                        commit('setLoading', false)
                        commit('setError', error)
                    }
                )
        },
        signUserIn({ commit }, payload) {
            commit('setLoading', true)
            commit('clearError')
            firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
                .then(
                    auth => {
                        firebase.database().ref('users').child(auth.user.uid).once('value', data => {
                            commit('setLoading', false)
                            const newUser = {
                                id: auth.user.uid,
                                username: auth.user.email
                            }
                            commit('setUser', newUser)
                        })
                    }
                )
                .catch(
                    error => {
                        commit('setLoading', false)
                        commit('setError', error)
                    }
                )
        }
    },
    getters: {
        user(state) {
            return state.user
        }
    }
}

export default AuthModule