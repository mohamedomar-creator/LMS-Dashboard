// Metrics Data
const metrics = {
  users: 1200,
  messages: 350,
  courses: 25,
  lessons: 140
};

// Display Metrics
document.getElementById("usersCount").innerText = metrics.users;
document.getElementById("messagesCount").innerText = metrics.messages;
document.getElementById("coursesCount").innerText = metrics.courses;
document.getElementById("lessonsCount").innerText = metrics.lessons;

// Chart.js Example
const ctx = document.getElementById("usersChart").getContext("2d");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Active Users",
        data: [200, 400, 650, 800, 1100, 1200],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
        tension: 0.3
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top"
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
