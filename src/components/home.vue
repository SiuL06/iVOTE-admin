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
      <button class="btn add-nominee" @click="openPositionSelectionModal">
        Add Nominee
      </button>
      <button class="btn reset" @click="resetAndRemoveNominees">Reset</button>
      <button
        class="btn submit-votes"
        @click="submitVotes"
        :disabled="nominees.length === 0 || isSubmitting"
      >
        Submit Votes
      </button>
      <button class="btn logout" @click="logout">Logout</button>
    </div>

    <!-- Positions and Nominees -->
    <div
      class="position-container"
      v-for="(nominees, position) in groupedNominees"
      :key="position"
    >
      <h2 class="position-title">{{ position }}</h2>
      <div class="nominees-row">
        <div
          v-for="nominee in nominees"
          :key="nominee.id"
          class="card id-card"
        >
          <div class="photo-container">
            <img
              v-if="nominee.photo"
              :src="nominee.photo"
              alt="Nominee Photo"
              class="nominee-photo"
            />
            <button
              v-else
              class="btn add-photo"
              @click="addPhoto(nominee.id)"
            >
              Add Photo
            </button>
          </div>
          <div class="info-container">
            <h3 class="nominee-title">{{ nominee.name }}</h3>
            <p class="votes-label">
              Votes: <span>{{ nominee.score }}</span>
            </p>
          </div>
          <button
            class="btn remove-candidate"
            @click="removeCandidate(nominee.id)"
          >
            Remove Candidate
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Position Selection -->
    <div v-if="showPositionModal" class="modal-overlay">
      <div class="modal">
        <h3>Select Position</h3>
        <div class="position-buttons">
          <button
            v-for="position in validPositions"
            :key="position"
            class="btn position-btn"
            @click="addNominee(position)"
          >
            {{ position }}
          </button>
        </div>
        <button class="btn close-modal" @click="closePositionSelectionModal">
          Close
        </button>
      </div>
    </div>

    <p class="year">2024</p>
    <p class="footer">Group 7 (iVOTE)</p>
  </div>
</template>

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
      <button class="btn add-nominee" @click="openPositionSelectionModal">
        Add Nominee
      </button>
      <button class="btn reset" @click="resetAndRemoveNominees">Reset</button>
      <button
        class="btn submit-votes"
        @click="submitVotes"
        :disabled="nominees.length === 0 || isSubmitting"
      >
        Submit Votes
      </button>
      <button class="btn logout" @click="logout">Logout</button>
    </div>

    <!-- Positions and Nominees -->
    <div
      class="position-container"
      v-for="(nominees, position) in sortedGroupedNominees"
      :key="position"
    >
      <h2 class="position-title">{{ position }}</h2>
      <div class="nominees-row">
        <div
          v-for="nominee in nominees"
          :key="nominee.id"
          class="card id-card"
        >
          <div class="photo-container">
            <img
              v-if="nominee.photo"
              :src="nominee.photo"
              alt="Nominee Photo"
              class="nominee-photo"
            />
            <button
              v-else
              class="btn add-photo"
              @click="addPhoto(nominee.id)"
            >
              Add Photo
            </button>
          </div>
          <div class="info-container">
            <h3 class="nominee-title">{{ nominee.name }}</h3>
            <p class="votes-label">
              Votes: <span>{{ nominee.score }}</span>
            </p>
          </div>
          <button
            class="btn remove-candidate"
            @click="removeCandidate(nominee.id)"
          >
            Remove Candidate
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Position Selection -->
    <div v-if="showPositionModal" class="modal-overlay">
      <div class="modal">
        <h3>Select Position</h3>
        <div class="position-buttons">
          <button
            v-for="position in validPositions"
            :key="position"
            class="btn position-btn"
            @click="addNominee(position)"
          >
            {{ position }}
          </button>
        </div>
        <button class="btn close-modal" @click="closePositionSelectionModal">
          Close
        </button>
      </div>
    </div>

    <p class="year">2024</p>
    <p class="footer">Group 7 (iVOTE)</p>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default {
  name: "HomePage",
  data() {
    return {
      nominees: [],
      showPositionModal: false,
      validPositions: [
        "PRESIDENT",
        "VICE-PRESIDENT",
        "SECRETARY",
        "TREASURER",
        "AUDITOR",
        "BUSINESS MANAGER",
        "PUBLIC INFORMATION OFFICER",
        "PUBLIC RELATIONS OFFICER",
        "CREATIVE DIRECTOR",
        "EXECUTIVE ASSISTANT TO THE PRESIDENT",
        "ASSISTANT SECRETARY",
        "ASSISTANT TREASURER",
        "ASSISTANT AUDITOR",
        "ASSISTANT BUSINESS MANAGER",
        "ASSISTANT CREATIVE DIRECTOR",
        "CHIEF OF STAFF",
        "EXECUTIVE STAFF",
      ],
      isSubmitting: false,
    };
  },
  computed: {
    // This computed property ensures that the positions are sorted in the desired order
    sortedGroupedNominees() {
      const grouped = this.groupedNominees;
      const sorted = {};

      this.validPositions.forEach(position => {
        if (grouped[position]) {
          sorted[position] = grouped[position];
        }
      });

      return sorted;
    },
    groupedNominees() {
      return this.nominees.reduce((groups, nominee) => {
        const position = nominee.position || "Others";
        if (!groups[position]) groups[position] = [];
        groups[position].push(nominee);
        return groups;
      }, {});
    },
  },
  methods: {
    openPositionSelectionModal() {
      this.showPositionModal = true;
    },
    closePositionSelectionModal() {
      this.showPositionModal = false;
    },
    async addNominee(position) {
      const name = prompt("Enter nominee's name:");
      if (!name) return;

      const nominee = {
        name,
        position,
        score: 0,
        photo: null,
      };

      const db = getFirestore();
      try {
        const docRef = await addDoc(collection(db, "nominees"), nominee);
        this.nominees.push({ ...nominee, id: docRef.id });
        alert(`Nominee for ${position} added successfully!`);
      } catch (error) {
        console.error("Error adding nominee:", error);
      } finally {
        this.closePositionSelectionModal();
      }
    },
    async addPhoto(nomineeId) {
      const nomineeIndex = this.nominees.findIndex((n) => n.id === nomineeId);
      if (nomineeIndex === -1) {
        console.error("Nominee not found");
        return;
      }

      const photoFile = await this.uploadPhoto();
      if (photoFile) {
        this.nominees[nomineeIndex].photo = photoFile;

        const db = getFirestore();
        const nomineeRef = doc(db, "nominees", nomineeId);
        try {
          await updateDoc(nomineeRef, { photo: photoFile });
        } catch (error) {
          console.error("Error updating photo in Firestore:", error);
        }
      }
    },
    async uploadPhoto() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      return new Promise((resolve) => {
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result);
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
        await deleteDoc(doc(db, "nominees", nomineeId));
        this.nominees = this.nominees.filter((nominee) => nominee.id !== nomineeId);
      } catch (error) {
        console.error("Error removing nominee:", error);
      }
    },
    async resetAndRemoveNominees() {
      const db = getFirestore();
      try {
        const snapshot = await getDocs(collection(db, "nominees"));
        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        this.nominees = [];
        alert("All nominees have been removed.");
      } catch (error) {
        console.error("Error removing nominees:", error);
      }
    },
    async fetchNominees() {
      const db = getFirestore();
      try {
        const snapshot = await getDocs(collection(db, "nominees"));
        this.nominees = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      } catch (error) {
        console.error("Error fetching nominees:", error);
      }
    },
    async submitVotes() {
      if (this.nominees.length === 0) {
        alert("No nominees to submit votes for.");
        return;
      }

      this.isSubmitting = true;

      try {
        const db = getFirestore();
        const resultsCollection = collection(db, "electionresults");

        const votes = this.nominees.map((nominee) => ({
          name: nominee.name,
          position: nominee.position,
          votes: nominee.score,
          timestamp: new Date(),
        }));

        const savePromises = votes.map((vote) => addDoc(resultsCollection, vote));
        await Promise.all(savePromises);

        alert("Votes have been successfully saved to election results!");
        console.log("Election results saved:", votes);
      } catch (error) {
        console.error("Error saving election results:", error);
        alert("An error occurred while saving election results. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },
    logout() {
      localStorage.removeItem("authToken");
      this.$router.push("/");
    },
  },
  mounted() {
    this.fetchNominees();
  },
};
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.position-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.position-btn {
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.position-btn:hover {
  background-color: #0056b3;
}

.close-modal {
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  background-color: #ff0000;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.close-modal:hover {
  background-color: #cc0000;
}

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
  min-height: 100vh;
  background-color: #3b3b50;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20px;
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

.department-label {
  font-size: 14px;
  margin-top: 5px;
  color: #555;
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
