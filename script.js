// مثال أرقام الكروت (ممكن تربطها بملف JSON أو Google Sheet بعدين)
document.getElementById("usersCount").textContent = 150;
document.getElementById("messagesCount").textContent = 320;
document.getElementById("projectsCount").textContent = 12;

// رسم جراف باستخدام Chart.js
const ctx = document.getElementById('lineChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      label: 'Users Growth',
      data: [50, 80, 120, 180, 220, 300],
      borderColor: 'blue',
      fill: false
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  }
});
