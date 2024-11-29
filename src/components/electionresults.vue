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

    <h2 class="header results-title">Election Results</h2>
    <div class="results-container">
      <div v-for="(candidates, position) in results" :key="position" class="position-container">
        <h3 class="position-title">{{ position }}</h3>
        <table class="results-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Total Votes</th>
              <th>% by Department</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="candidate in candidates" :key="candidate.name">
              <td>{{ candidate.name }}</td>
              <td>{{ candidate.totalVotes }}</td>
              <td>
                <div v-for="(percent, department) in candidate.departmentPercentages" :key="department">
                  {{ department }}: {{ percent.toFixed(2) }}%
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
    };
  },
  async created() {
    await this.fetchResults();
  },
  methods: {
    async fetchResults() {
      const db = getFirestore();

      const votesSnapshot = await getDocs(collection(db, "electionresults")); // Collection for votes
      const nomineesSnapshot = await getDocs(collection(db, "nominees")); // Collection for nominees

      const departmentCounts = {};
      const groupedResults = {};

      // Count total votes per department
      votesSnapshot.forEach((doc) => {
        const vote = doc.data();
        const { department } = vote;

        if (department) {
          if (!departmentCounts[department]) {
            departmentCounts[department] = 0;
          }
          departmentCounts[department] += 1;
        }
      });

      // Initialize groupedResults with positions and nominees
      nomineesSnapshot.forEach((doc) => {
        const nominee = doc.data();
        const { name, position, score } = nominee;

        if (!groupedResults[position]) {
          groupedResults[position] = [];
        }

        groupedResults[position].push({
          name: name || "No Name Provided",
          totalVotes: score || 0,
          departmentPercentages: {}, // Will be calculated below
        });
      });

      // Calculate department percentages for each nominee
      votesSnapshot.forEach((doc) => {
        const vote = doc.data();
        const { candidate, department } = vote;

        if (candidate && department) {
          // Find the candidate in groupedResults
          for (const position in groupedResults) {
            const nominee = groupedResults[position].find((n) => n.name === candidate);
            if (nominee) {
              // Increment the department count for this candidate
              if (!nominee.departmentPercentages[department]) {
                nominee.departmentPercentages[department] = 0;
              }
              nominee.departmentPercentages[department] += 1;
            }
          }
        }
      });

      // Calculate percentages for each department
      for (const position in groupedResults) {
        groupedResults[position].forEach((nominee) => {
          for (const department in nominee.departmentPercentages) {
            nominee.departmentPercentages[department] =
              (nominee.departmentPercentages[department] / departmentCounts[department]) * 100;
          }
        });
      }

      this.results = groupedResults;
    },
  },
};
</script>

<style scoped>
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

.results-container {
  width: 80%;
  margin: 20px auto;
  background-color: #ffffff;
  color: #000000;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.position-container {
  margin-bottom: 20px;
}

.position-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  color: #000;
  text-transform: uppercase;
}

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
