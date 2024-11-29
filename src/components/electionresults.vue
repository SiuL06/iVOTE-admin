
<template>
  <div class="constraint-layout">
    <div class="overlay">
      <h2>Election Results</h2>
      <table class="results-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Total Votes</th>
            <th>% by Department</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="candidate in results" :key="candidate.name">
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
</template>

<script>
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default {
  name: "ElectionResults",
  data() {
    return {
      results: [], // Stores the election results
    };
  },
  async created() {
    await this.fetchResults();
  },
  methods: {
    async fetchResults() {
      const db = getFirestore();
      const votesSnapshot = await getDocs(collection(db, "votes"));
      const departments = {};
      const candidates = {};

      // Count votes for each candidate and department
      votesSnapshot.forEach((doc) => {
        const vote = doc.data();
        const { candidate, department } = vote;

        if (!candidates[candidate]) {
          candidates[candidate] = { totalVotes: 0, departments: {} };
        }

        candidates[candidate].totalVotes += 1;
        candidates[candidate].departments[department] = (candidates[candidate].departments[department] || 0) + 1;

        if (!departments[department]) {
          departments[department] = 0;
        }

        departments[department] += 1;
      });

      // Calculate percentage by department for each candidate
      this.results = Object.entries(candidates).map(([name, data]) => {
        const departmentPercentages = {};
        for (const [department, count] of Object.entries(data.departments)) {
          departmentPercentages[department] = (count / departments[department]) * 100;
        }

        return { name, totalVotes: data.totalVotes, departmentPercentages };
      });
    },
  },
};
</script>

<style scoped>
/* Add styles similar to the ones used for your Register component */
</style>
