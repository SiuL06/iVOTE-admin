<template>
  <div class="container">
    <header class="navbar">
      <h1></h1>
      <nav>
        <ul>
          <li><RouterLink to="/home" class="btn">Home</RouterLink></li>
          <li><RouterLink to="/electionresults" class="btn">Election Results</RouterLink></li>
        </ul>
      </nav>
    </header>

    <img src="@/assets/ivotelogo.png" alt="Logo" class="logo" />
    <h1 class="header">COMMISSION ON STUDENT ELECTIONS</h1>

    <div class="buttons-container">
      <button class="btn add-nominee" @click="addNominee">Add Nominee</button>
      <button class="btn reset" @click="resetAndRemoveNominees">Reset</button>
      <button class="btn submit-votes" @click="submitVotes" :disabled="nominees.length === 0 || isSubmitting">
        Submit Votes
      </button>
      <button class="btn logout" @click="logout">Logout</button>
    </div>

    <!-- Positions and Nominees -->
    <div class="position-container" v-for="(nominees, position) in groupedNominees" :key="position">
      <h2 class="position-title">{{ position }}</h2>
      <div class="nominees-row">
        <div v-for="nominee in nominees" :key="nominee.id" class="card id-card">
          <div class="photo-container">
            <img v-if="nominee.photo" :src="nominee.photo" alt="Nominee Photo" class="nominee-photo" />
            <button v-else class="btn add-photo" @click="addPhoto(nominee.id)">Add Photo</button>
          </div>
          <div class="info-container">
            <h3 class="nominee-title">{{ nominee.name }}</h3>
            <p class="votes-label">Votes: <span>{{ nominee.score }}</span></p>
          </div>
          <button class="btn remove-candidate" @click="removeCandidate(nominee.id)">Remove Candidate</button>
        </div>
      </div>
    </div>

    <p class="year">2024</p>
    <p class="footer">Group 7 (iVOTE)</p>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default {
  name: 'HomePage',
  data() {
    return {
      nominees: [], // Array to store nominees and their vote counts
      socket: null,
      isSubmitting: false,
    };
  },
  computed: {
    groupedNominees() {
      return this.nominees.reduce((groups, nominee) => {
        const position = nominee.position || 'Others';
        if (!groups[position]) groups[position] = [];
        groups[position].push(nominee);
        return groups;
      }, {});
    },
  },
  mounted() {
    this.socket = io('http://localhost:3001');

    this.socket.on('connect', () => {
      console.log('Connected to backend server on port 3001');
    });

    this.fetchNominees();

    this.socket.on('nomineeUpdate', (updatedNominees) => {
      this.updateNomineeData(updatedNominees);
    });
  },
  methods: {
    async addNominee() {
      const name = prompt("Enter nominee's name:");
      if (!name) return;

      const position = prompt("Enter the position the nominee is running for (e.g., President, Vice-President):");
      if (!position) return;

      const nominee = {
        name,
        position,
        score: 0, // Initial vote count
        photo: null, // No photo initially
      };

      const db = getFirestore();
      try {
        const docRef = await addDoc(collection(db, 'nominees'), nominee); // Save to Firestore
        this.nominees.push({ ...nominee, id: docRef.id }); // Add to local state
        alert('Nominee added successfully!');
      } catch (error) {
        console.error('Error adding nominee:', error);
      }
    },
    async addPhoto(nomineeId) {
      const nomineeIndex = this.nominees.findIndex((n) => n.id === nomineeId);
      if (nomineeIndex === -1) {
        console.error('Nominee not found');
        return;
      }

      const photoFile = await this.uploadPhoto();
      if (photoFile) {
        this.nominees[nomineeIndex].photo = photoFile;

        // Update Firestore with the photo URL
        const db = getFirestore();
        const nomineeRef = doc(db, 'nominees', nomineeId);
        try {
          await updateDoc(nomineeRef, { photo: photoFile });
          console.log('Photo updated successfully in Firestore.');
        } catch (error) {
          console.error('Error updating photo in Firestore:', error);
        }
      } else {
        console.warn('Photo upload failed or was canceled');
      }
    },
    async uploadPhoto() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      return new Promise((resolve) => {
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result); // Return base64 data URL
            };
            reader.readAsDataURL(file);
          } else {
            resolve(null);
          }
        };
        input.click();
      });
    },
    async removeCandidate(nomineeId) {
      const db = getFirestore();
      try {
        // Remove nominee from Firestore
        await deleteDoc(doc(db, 'nominees', nomineeId));

        // Remove nominee from local state
        this.nominees = this.nominees.filter((nominee) => nominee.id !== nomineeId);
        alert('Nominee removed successfully!');
      } catch (error) {
        console.error('Error removing nominee:', error);
      }
    },
    async resetAndRemoveNominees() {
      const db = getFirestore();
      try {
        // Fetch all nominees and delete them from Firestore
        const snapshot = await getDocs(collection(db, 'nominees'));
        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Clear the local state
        this.nominees = [];
        alert('All nominees have been removed.');
      } catch (error) {
        console.error('Error removing nominees:', error);
      }
    },
    async fetchNominees() {
      const db = getFirestore();
      try {
        const snapshot = await getDocs(collection(db, 'nominees'));
        this.nominees = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      } catch (error) {
        console.error('Error fetching nominees:', error);
      }
    },
    async submitVotes() {
      this.isSubmitting = true;

      console.log('Votes submitted:', this.nominees);
      alert('Votes submitted successfully!');

      this.isSubmitting = false;
    },
    logout() {
      localStorage.removeItem('authToken');
      this.$router.push('/');
    },
    updateNomineeData(updatedNominees) {
      this.nominees = updatedNominees.map((nominee) => ({
        ...nominee,
        score: nominee.score || 0,
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
.remove-candidate {
  background-color: #ff0000;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
}

.container {
  width: 100%;
  min-height: 100vh; /* Allow content to dictate height */
  background-color: #3b3b50;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  padding-bottom: 20px; /* Add padding at the bottom for better spacing */
}

.position-container {
  width: 80%;
  margin-top: 30px;
}

.position-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  color: #ffffff;
  text-transform: uppercase;
  border-bottom: 2px solid #ffffff;
  padding-bottom: 5px;
}

.nominees-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.id-card {
  width: 200px;
  height: 300px;
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #ddd;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: transform 0.3s;
}

.id-card:hover {
  transform: scale(1.05);
}

.photo-container {
  width: 100%;
  height: 150px;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #ddd;
}

.nominee-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.info-container {
  padding: 10px;
  text-align: center;
}

.nominee-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.votes-label {
  font-size: 16px;
}

.add-photo {
  background-color: #ffc107;
  color: #000;
  font-size: 14px;
  padding: 5px 10px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.6);
  border-bottom: 2px solid #ddd;
  font-family: agrandir;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 10;
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
  opacity: 0.3;
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
