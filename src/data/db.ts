import firebase from 'firebase/app'
import 'firebase/database'

require('firebase/auth')

const firebaseConfig = {
  apiKey: "AIzaSyDJaWCmgWuX7KHMeS0v5gzprBBvi9BVd6g",
  authDomain: "seo-eo-game.firebaseapp.com",
  databaseURL: "https://seo-eo-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "seo-eo-game",
  storageBucket: "seo-eo-game.appspot.com",
  messagingSenderId: "699564810580",
  appId: "1:699564810580:web:c8342b2780d71bde3de8c1"
};

// Get a RTDB instance
export const rootDatabase = firebase
  .initializeApp(firebaseConfig)
  .database()
