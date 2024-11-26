<template>
  <div class="container">
    <header class="navbar">
      <h1></h1>
      <nav>
        <ul>
          <li><RouterLink to="/home" class="btn">Home</RouterLink></li>
          <li><RouterLink to="/register" class="btn">Register</RouterLink></li>
        </ul>
      </nav>
    </header>

    <img src="@/assets/ivotelogo.png" alt="Logo" class="logo" />
    <h1 class="header">COMMISSION ON STUDENT ELECTIONS</h1>
    <h2 class="nominees-label">Nominees:</h2>

    <div class="buttons-container">
      <button class="btn add-nominee" @click="addNominee">Add Nominee</button>
      <button class="btn reset" @click="resetAndRemoveNominees">Reset</button>
      <button class="btn submit-votes" @click="submitVotes" :disabled="nominees.length === 0 || isSubmitting">
        Submit Votes
      </button>
      <button class="btn logout" @click="logout">Logout</button>
    </div>

    <div class="nominees-container">
      <div v-for="nominee in nominees" :key="nominee.id" class="card">
        <h3 class="nominee-title">{{ nominee.name }}</h3>
        <p>Votes: <span>{{ nominee.score }}</span></p> <!-- Display nominee score -->
        <button class="btn rename" @click="renameNominee(nominee.id)">Rename</button>
      </div>
    </div>



    <p class="year">2024</p>
    <p class="footer">Group 7 (iVOTE)</p>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import { db } from '@/firebase'; // Adjust the path as necessary
import { collection, onSnapshot, addDoc } from 'firebase/firestore'; // For Firestore

export default {
  name: 'HomePage',
  data() {
    return {
      nominees: [], // Array to store nominees and their vote counts
      nextId: 1,
      socket: null,
      isSubmitting: false,
    };
  },
  mounted() {
    // Connect to backend running on port 3001
    this.socket = io('http://localhost:3001');

    this.socket.on('connect', () => {
      console.log('Connected to backend server on port 3001');
    });

    // Fetch nominees' votes from Firestore
    this.fetchNominees();

    // Listen for nominee updates from the backend
    this.socket.on('nomineeUpdate', (updatedNominees) => {
      this.updateNomineeData(updatedNominees); // Update nominees with the new data
    });
  },
  methods: {
    addNominee() {
      const name = prompt("Enter nominee's name:");
      if (name) {
        const nominee = { id: this.nextId.toString(), name, score: 0 };
        this.nominees.push(nominee);
        this.nextId++;
        this.socket.emit('addNominee', nominee); // Emit to backend
      }
    },

    resetAndRemoveNominees() {
      this.nominees = [];
      this.nextId = 1;
    },

    renameNominee(nomineeId) {
      const nominee = this.nominees.find(n => n.id === nomineeId);
      if (nominee) {
        const newName = prompt("Enter the new name:");
        if (newName) {
          nominee.name = newName;
          this.socket.emit('renameNominee', nominee); // Emit to backend
        }
      }
    },

    async fetchNominees() {
      const votesCollection = collection(db, 'votes');
      onSnapshot(votesCollection, (snapshot) => {
        const voteCounts = {};
        snapshot.forEach(doc => {
          const vote = doc.data().vote;
          if (voteCounts[vote]) {
            voteCounts[vote]++;
          } else {
            voteCounts[vote] = 1;
          }
        });
        this.updateNomineeScores(voteCounts);
      });
    },

    updateNomineeScores(voteCounts) {
      this.nominees.forEach(nominee => {
        nominee.score = voteCounts[nominee.name] || 0; // Update score based on vote counts
      });
    },

    async submitVotes() {
      this.isSubmitting = true;

      // Prepare the data to be saved
      const electionResults = this.nominees.map(nominee => ({
        name: nominee.name,
        score: nominee.score,
        timestamp: new Date().toISOString() // Add a timestamp for when the votes were submitted
      }));

      // Save each nominee's result to Firestore
      const resultsCollection = collection(db, 'electionResults'); // Reference to the results collection
      try {
        for (const result of electionResults) {
          await addDoc(resultsCollection, result); // Save each result
        }
        console.log('Votes submitted:', electionResults);
        alert('Votes submitted successfully!'); // Optional: Notify the user
      } catch (error) {
        console.error('Error submitting votes:', error);
        alert('Error submitting votes. Please try again.'); // Optional: Notify the user
      }

      this.isSubmitting = false;
    },

    logout() {
      localStorage.removeItem('authToken'); // Clear authentication state
      this.$router.push('/'); // Redirect to login page
    },

    updateNomineeData(updatedNominees) {
      this.nominees = updatedNominees.map(nominee => ({
        ...nominee,
        score: nominee.score || 0 // Ensure there's a score property
      }));
    },
  },
  beforeUnmount() {
    if (this.socket) {
 this.socket.disconnect();
    }
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>


<style scoped>

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.6);
  border-bottom: 2px solid #ddd;
  font-family: agrandir;
  width: 100%;
}

.navbar nav ul {
  list-style: none;
  display: flex;
}

.navbar nav ul li {
  margin-right: 20px;
  transition: 0.3s;
}

.navbar nav ul li:hover {
  opacity: .3;
}

.btn {
  background-color: none;
  font-size: 20px;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 5px;
  transition: 0.3s ease;
  cursor: pointer;
}

.container {
  width: 100%;
  height: 100vh;
  background-color: #3b3b50;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.logo {
  width: 200px;
  height: 100px;
  margin-top: 20px;
}

.header {
  margin: 10px 0;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.nominees-label {
  margin-top: 20px;
  font-size: 20px;
  text-align: center;
}

.scores-label {
  margin-top: 20px;
  font-size: 20px;
  text-align: center;
}

.buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.add-nominee {
  background-color: #ffc107;
  color: #000;
}

.reset {
  background-color: #ff0000;
  color: #fff;
}

.submit-votes {
  background-color: #007bff;
  color: #fff;
}

.nominees-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  margin-top: 20px;
}

.scores-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  margin-top: 20px;
}

.card, .score-card {
  background-color: #4a4a61;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  width: 45%;
  max-width: 200px;
}

.nominee-title {
  font-size: 18px;
  margin-bottom: 10px;
}

.score {
  font-size: 48px;
  margin: 20px 0;
}

.rename,
.reset {
  background-color: #007bff;
  color: #fff;
  margin: 5px 0;
}

.adjust-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.plus,
.minus {
  background-color: #28a745;
  color: #fff;
  width: 40px;
}

.year {
  margin-top: auto;
  font-size: 16px;
  margin-bottom: 5px;
}

.footer {
  font-size: 12px;
  margin-bottom: 20px;
}
</style>
