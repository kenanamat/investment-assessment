import firebase from 'firebase/app'
import 'firebase/database'

// Get a RTDB instance
export const rootDatabase = firebase
  .initializeApp({ databaseURL: 'https://invesment-assessment-default-rtdb.europe-west1.firebasedatabase.app/' })
  .database()


