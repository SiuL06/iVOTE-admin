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

    <button class="btn submit-votes" @click="displayWinners">Display Results</button>
    <button class="btn print-pdf" @click="printAsPDF">Print as PDF</button>

    <h2 class="header results-title">Election Results</h2>

    <div class="results-container">
      <div v-for="position in orderedPositions" :key="position" class="position-container">
        <h3 class="position-title">
          {{ position }}
          <span v-if="winners[position]">
            -
            <strong>{{ winners[position].status }}:</strong>
            {{ winners[position].candidates }}
          </span>
        </h3>

        <table class="results-table" v-if="results[position]">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Total Votes</th>
              <th>% by Department</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="candidate in results[position]" :key="candidate.name">
              <td>
                <img :src="candidate.photo" alt="Candidate Photo" class="candidate-photo" />
                {{ candidate.name }}
              </td>
              <td>{{ candidate.totalVotes }}</td>
              <td>
                <table class="department-percentages-inner-table">
                  <tr v-for="(percent, department) in candidate.departmentPercentages" :key="department">
                    <td>{{ department }}</td>
                    <td>{{ percent.toFixed(2) }}%</td>
                  </tr>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No data available for {{ position }}</p>
      </div>
    </div>

    <p class="year">2024</p>
    <p class="footer">Group 7 (iVOTE)</p>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default {
  name: "ElectionResults",
  data() {
    return {
      results: {}, // Stores the election results grouped by positions
      winners: {}, // Stores the winner for each position
      orderedPositions: [
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
    };
  },
  async created() {
    await this.fetchResults();
  },
  methods: {
    async fetchResults() {
      const db = getFirestore();

      try {
        const votesSnapshot = await getDocs(collection(db, "votes"));
        const nomineesSnapshot = await getDocs(collection(db, "nominees"));

        const nomineesData = {};
        nomineesSnapshot.forEach((doc) => {
          const nominee = doc.data();
          nomineesData[nominee.name] = nominee.photo; // Map candidate name to photo
        });

        const groupedResults = {};
        const departments = [
          "AAA", "BACC", "BATAS", "BHS-PHS", "CDW", "CHARMS", "CRCYC", "CREATE",
          "ICPEP", "INA", "JPIA", "JPPhA", "LEAD", "LTSP", "MCSA", "NSC", "PICE",
          "PIIE", "PsychSoc", "SSITE", "VE", "UASAO",
        ];
        const positionVoteCounts = {};

        votesSnapshot.forEach((doc) => {
          const vote = doc.data();
          const { Candidate, Department, Position } = vote;

          if (!groupedResults[Position]) {
            groupedResults[Position] = [];
            positionVoteCounts[Position] = 0;
          }

          positionVoteCounts[Position] += 1;

          let candidate = groupedResults[Position].find(
            (c) => c.name === Candidate
          );
          if (!candidate) {
            candidate = {
              name: Candidate,
              totalVotes: 0,
              photo: nomineesData[Candidate] || "", // Add photo
              departmentPercentages: {},
            };
            groupedResults[Position].push(candidate);
          }

          candidate.totalVotes += 1;
          if (!candidate.departmentPercentages[Department]) {
            candidate.departmentPercentages[Department] = 0;
          }
          candidate.departmentPercentages[Department] += 1;
        });

        for (const position in groupedResults) {
          groupedResults[position].forEach((candidate) => {
            departments.forEach((department) => {
              if (!candidate.departmentPercentages[department]) {
                candidate.departmentPercentages[department] = 0;
              }
            });
            for (const department in candidate.departmentPercentages) {
              if (positionVoteCounts[position] > 0) {
                candidate.departmentPercentages[department] =
                  (candidate.departmentPercentages[department] /
                    positionVoteCounts[position]) *
                  100;
              } else {
                candidate.departmentPercentages[department] = 0;
              }
            }
          });
        }

        this.results = groupedResults;
      } catch (error) {
        console.error("Error fetching election results:", error);
      }
    },

    async displayWinners() {
      const winners = {};
      for (const position in this.results) {
        const candidates = this.results[position];
        const maxVotes = Math.max(...candidates.map((candidate) => candidate.totalVotes));
        const tiedCandidates = candidates.filter(
          (candidate) => candidate.totalVotes === maxVotes
        );

        if (tiedCandidates.length > 1) {
          winners[position] = {
            status: "Tied",
            candidates: tiedCandidates.map((candidate) => candidate.name).join(", "),
          };
        } else {
          winners[position] = {
            status: "Winner",
            candidates: tiedCandidates[0].name,
          };
        }
      }

      this.winners = winners;
      alert(this.formatWinnersMessage(winners));
      console.log("Winners:", this.winners);
    },

    formatWinnersMessage(winners) {
      let message = "";
      for (const position in winners) {
        const winner = winners[position];
        if (winner.status === "Tied") {
          message += `${position}: Tied - ${winner.candidates}\n`;
        } else {
          message += `${position}: Winner - ${winner.candidates}\n`;
        }
      }
      return message;
    },

    printAsPDF() {
      window.print();
    },
  },
};
</script>

<style scoped>
.candidate-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  vertical-align: middle;
}

.submit-votes {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.submit-votes:hover {
  background-color: #0056b3;
}

/* Print as PDF Button */
.print-pdf {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.print-pdf:hover {
  background-color: #218838;
}

/* General Container Styles */
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #3b3b50;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding-bottom: 20px;
}

/* Results Container */
.results-container {
  width: 80%;
  margin: 20px auto;
  background-color: #ffffff;
  color: #000000;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Position Container */
.position-container {
  margin-bottom: 20px;
}

/* Position Title Styling */
.position-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  color: #000;
  text-transform: uppercase;
}

/* Table Styling */
.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.results-table th,
.results-table td {
  border: 1px solid #ddd;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.results-table th {
  background-color: #007bff;
  color: white;
}

.results-table tr:nth-child(even) {
  background-color: #f4f4f4;
}

.results-table tr:hover {
  background-color: #ddd;
}

/* Department Percentages Table */
.department-percentages-inner-table {
  width: 100%;
  border-collapse: collapse;
}

.department-percentages-inner-table td {
  border: 1px solid #ddd;
  text-align: left;
  padding: 5px;
  font-size: 12px;
}

.department-percentages-inner-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* Navbar Styling */
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

/* Navbar Links */
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

/* Button Styling */
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

/* Logo Styling */
.logo {
  width: 200px;
  height: 100px;
  margin-top: 20px;
}

/* Header Styling */
.header {
  margin: 10px 0;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

/* Footer Styling */
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
