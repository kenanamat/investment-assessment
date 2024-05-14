import firebase from 'firebase/app'
import 'firebase/database'

require('firebase/auth')

const firebaseConfig = {
  apiKey: "AIzaSyBuOYuQ4_vXgIF8c2QIS2uHOZwyKwBA71A",
  authDomain: "invesment-assessment.firebaseapp.com",
  databaseURL: "https://invesment-assessment-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "invesment-assessment",
  storageBucket: "invesment-assessment.appspot.com",
  messagingSenderId: "927518404340",
  appId: "1:927518404340:web:db8e144487152a8863f8a1"
};


// Get a RTDB instance
export const rootDatabase = firebase
  .initializeApp(firebaseConfig)
  .database()
