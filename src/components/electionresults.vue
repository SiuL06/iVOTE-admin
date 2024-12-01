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

    <!-- Moved Submit Votes Button here -->
    <button class="btn submit-votes" @click="displayWinners">Submit Votes</button>

    <!-- Print as PDF Button -->
    <button class="btn print-pdf" @click="printAsPDF">Print as PDF</button>

    <h2 class="header results-title">Election Results</h2>

    <div class="results-container">
      <div v-for="position in orderedPositions" :key="position" class="position-container">
        <h3 class="position-title">{{ position }}
          <span v-if="winners[position]"> - WINNER: {{ winners[position].name }}</span>
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
              <td>{{ candidate.name }}</td>
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
        const votesSnapshot = await getDocs(collection(db, "votes")); // Fetch votes collection
        const groupedResults = {}; // Store results grouped by position

        // List of all departments
        const departments = [
          "SAS", "COA", "SBPA", "BSIT", "BSEd", "BEEd", "BSCE", "BSArch",
          "BSHM", "BSTM", "BSN", "BSP",
        ];

        // Track total votes per position
        const positionVoteCounts = {};

        // Group votes by position and candidate
        votesSnapshot.forEach((doc) => {
          const vote = doc.data();
          const { Candidate, Department, Position } = vote;

          if (!groupedResults[Position]) {
            groupedResults[Position] = [];
            positionVoteCounts[Position] = 0;
          }

          // Increment the total vote count for the position
          positionVoteCounts[Position] += 1;

          // Find the candidate in the results or add them if they don't exist
          let candidate = groupedResults[Position].find(
            (c) => c.name === Candidate
          );
          if (!candidate) {
            candidate = {
              name: Candidate,
              totalVotes: 0,
              departmentPercentages: {},
            };
            groupedResults[Position].push(candidate);
          }

          // Increment candidate's total votes and their department vote count
          candidate.totalVotes += 1;
          if (!candidate.departmentPercentages[Department]) {
            candidate.departmentPercentages[Department] = 0;
          }
          candidate.departmentPercentages[Department] += 1;
        });

        // Calculate percentages for each candidate and fill in missing departments
        for (const position in groupedResults) {
          groupedResults[position].forEach((candidate) => {
            // Ensure all departments are included
            departments.forEach((department) => {
              if (!candidate.departmentPercentages[department]) {
                candidate.departmentPercentages[department] = 0;
              }
            });

            // Calculate department percentages based on total position votes
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
        console.error("Error fetching election results: ", error);
      }
    },

    // Method to display the winners after submitting votes and save all candidates' votes to Firestore
    async displayWinners() {
      const winners = {};

      // Calculate winners
      for (const position in this.results) {
        const candidates = this.results[position];
        const winner = candidates.reduce((max, candidate) =>
          candidate.totalVotes > max.totalVotes ? candidate : max
        );

        winners[position] = winner;
      }

      // Update the winners data
      this.winners = winners;

      // Display a message with the winners
      alert("Winners have been calculated and displayed!");

      // You can also choose to log winners to the console if needed
      console.log("Winners:", this.winners);
    },

    // Method to print the results as PDF (trigger the print dialog)
    printAsPDF() {
      window.print();  // This will trigger the print dialog of the browser
    }
  },
};
</script>

<style scoped>
/* Submit Votes Button */
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
